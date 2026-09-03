import "server-only";
import { prisma } from "@/lib/prisma";

export async function getPublishedProducts() {
  return prisma.product.findMany({
    where: { isPublished: true },
    include: {
      variants: { where: { isActive: true }, include: { images: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProductsByCategory(category: string) {
  return prisma.product.findMany({
    where: {
      isPublished: true,
      category: { equals: category, mode: "insensitive" },
    },
    include: {
      variants: { where: { isActive: true }, include: { images: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProductByHandle(handle: string) {
  return prisma.product.findUnique({
    where: { handle, isPublished: true },
    include: {
      variants: {
        where: { isActive: true },
        include: { images: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export function getCategories() {
  return ["Vestidos", "Enterizos", "Tops"] as const;
}

/** Primera imagen disponible de un producto (para tarjetas de catálogo). */
export function getPrimaryImage(
  product: Awaited<ReturnType<typeof getPublishedProducts>>[number],
) {
  for (const variant of product.variants) {
    if (variant.images[0]) return variant.images[0];
  }
  return null;
}
