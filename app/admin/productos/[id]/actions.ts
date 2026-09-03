"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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

  const destDir = path.join(process.cwd(), "public", "products", product.handle);
  await fs.mkdir(destDir, { recursive: true });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${product.handle}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(destDir, filename), buffer);

  await prisma.productImage.create({
    data: {
      productId,
      variantId,
      storagePath: `/products/${product.handle}/${filename}`,
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

  const filePath = path.join(process.cwd(), "public", image.storagePath);
  await fs.unlink(filePath).catch(() => {});

  revalidateStorefront(image.product.handle);
  revalidatePath(`/admin/productos/${image.productId}`);
}
