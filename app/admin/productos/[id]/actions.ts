"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { supabaseAdmin, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase";

function revalidateStorefront(handle: string) {
  revalidatePath("/");
  revalidatePath(`/producto/${handle}`);
  revalidatePath("/coleccion/[category]", "page");
}

export async function updateProduct(productId: string, formData: FormData) {
  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      title: String(formData.get("title")),
      descriptionHtml: String(formData.get("descriptionHtml") ?? ""),
      category: String(formData.get("category")),
      basePriceCop: parseInt(String(formData.get("basePriceCop")), 10),
      isPublished: formData.get("isPublished") === "on",
    },
  });
  revalidateStorefront(product.handle);
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/admin/productos");
}

export async function addVariant(productId: string, formData: FormData) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, error: "Producto no encontrado." };

  const colorName = String(formData.get("colorName") ?? "").trim();
  const priceCop = parseInt(String(formData.get("priceCop")), 10);
  const inventoryQty = parseInt(String(formData.get("inventoryQty") ?? "0"), 10);

  if (!colorName) return { ok: false, error: "Ingresa un color." };
  if (!Number.isFinite(priceCop) || priceCop <= 0) {
    return { ok: false, error: "Ingresa un precio válido." };
  }

  const sku = `PAO-${product.handle.toUpperCase()}-${slugify(colorName)}`;

  const existing = await prisma.productVariant.findUnique({ where: { sku } });
  if (existing) {
    return { ok: false, error: `Ya existe una variante con el SKU ${sku}.` };
  }

  await prisma.productVariant.create({
    data: {
      productId,
      colorName,
      sku,
      priceCop,
      inventoryQty: Number.isFinite(inventoryQty) ? inventoryQty : 0,
    },
  });

  revalidateStorefront(product.handle);
  revalidatePath(`/admin/productos/${productId}`);
  return { ok: true };
}

export async function updateVariant(
  variantId: string,
  productHandle: string,
  formData: FormData,
) {
  await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      priceCop: parseInt(String(formData.get("priceCop")), 10),
      inventoryQty: parseInt(String(formData.get("inventoryQty")), 10),
      isActive: formData.get("isActive") === "on",
    },
  });
  revalidateStorefront(productHandle);
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Subimos en dos pasos para no mandar la foto por la función serverless de
// Netlify (que tiene un límite de tamaño de petición de pocos MB): el
// servidor solo genera un permiso de subida de un solo uso, y el navegador
// sube el archivo directo a Supabase Storage.
export async function createImageUploadUrl(
  productId: string,
  fileName: string,
  contentType: string,
) {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return { ok: false as const, error: "Solo se aceptan imágenes JPG, PNG o WEBP." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false as const, error: "Producto no encontrado." };

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const storageKey = `${product.handle}/${product.handle}-${Date.now()}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .createSignedUploadUrl(storageKey);

  if (error || !data) {
    return { ok: false as const, error: "No se pudo preparar la subida." };
  }

  return { ok: true as const, storageKey, token: data.token };
}

export async function confirmImageUpload(
  productId: string,
  variantId: string | null,
  storageKey: string,
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false as const, error: "Producto no encontrado." };

  const { data: publicUrl } = supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(storageKey);

  await prisma.productImage.create({
    data: {
      productId,
      variantId,
      storagePath: publicUrl.publicUrl,
      altText: product.title,
    },
  });

  revalidateStorefront(product.handle);
  revalidatePath(`/admin/productos/${productId}`);
  return { ok: true as const };
}

export async function deleteProductImage(imageId: string) {
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { product: true },
  });
  if (!image) return;

  await prisma.productImage.delete({ where: { id: imageId } });

  // Las fotos del catálogo inicial viven en /public (parte del sitio
  // estático); solo las subidas desde el panel viven en Supabase Storage.
  if (image.storagePath.includes(`/${PRODUCT_IMAGES_BUCKET}/`)) {
    const storageKey = image.storagePath.split(`/${PRODUCT_IMAGES_BUCKET}/`)[1];
    if (storageKey) {
      await supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).remove([storageKey]);
    }
  }

  revalidateStorefront(image.product.handle);
  revalidatePath(`/admin/productos/${image.productId}`);
}
