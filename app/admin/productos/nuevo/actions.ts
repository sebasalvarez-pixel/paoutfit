"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify, slugifyHandle } from "@/lib/slug";

export async function createProduct(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "Vestidos");
  const descriptionHtml = String(formData.get("descriptionHtml") ?? "");
  const basePriceCop = parseInt(String(formData.get("basePriceCop")), 10);
  const isPublished = formData.get("isPublished") === "on";
  const colorName = String(formData.get("colorName") ?? "").trim();
  const inventoryQty = parseInt(String(formData.get("inventoryQty") ?? "0"), 10) || 0;

  if (!title) throw new Error("Ingresa un nombre para el producto.");
  if (!Number.isFinite(basePriceCop) || basePriceCop <= 0) {
    throw new Error("Ingresa un precio válido.");
  }
  if (!colorName) throw new Error("Ingresa al menos un color inicial.");

  let handle = slugifyHandle(title);
  const existing = await prisma.product.findUnique({ where: { handle } });
  if (existing) {
    handle = `${handle}-${Date.now().toString(36)}`;
  }

  const sku = `PAO-${handle.toUpperCase()}-${slugify(colorName)}`;

  const product = await prisma.product.create({
    data: {
      handle,
      title,
      category,
      descriptionHtml,
      basePriceCop,
      isPublished,
      variants: {
        create: {
          colorName,
          sku,
          priceCop: basePriceCop,
          inventoryQty,
        },
      },
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath("/coleccion/[category]", "page");
  redirect(`/admin/productos/${product.id}`);
}
