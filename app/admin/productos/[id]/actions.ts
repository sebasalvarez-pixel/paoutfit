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

export async function uploadProductImage(formData: FormData) {
  const productId = String(formData.get("productId"));
  const variantId = String(formData.get("variantId") || "") || null;
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Solo se aceptan imágenes JPG, PNG o WEBP." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, error: "Producto no encontrado." };

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${product.handle}-${Date.now()}.${ext}`;
  const storageKey = `${product.handle}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(storageKey, buffer, { contentType: file.type });
  if (uploadError) {
    return { ok: false, error: `No se pudo subir la imagen: ${uploadError.message}` };
  }

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
  return { ok: true };
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
