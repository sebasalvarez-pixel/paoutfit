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

/**
 * "Los más comprados" para el home: productos ordenados por unidades
 * vendidas de verdad (pedidos pagados/enviados). Mientras la tienda no
 * tenga ventas todavía, muestra los productos que ya tienen foto en vez
 * de una sección vacía.
 */
export async function getBestSellers(limit = 4) {
  const topSales = await prisma.orderItem.groupBy({
    by: ["variantId"],
    where: { order: { status: { in: ["paid", "fulfilled"] } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit * 3, // variantes de sobra por si varias son del mismo producto
  });

  if (topSales.length > 0) {
    // Reconstruimos el orden por producto (no por variante) sin duplicar.
    const variantToProduct = new Map(
      (
        await prisma.productVariant.findMany({
          where: { id: { in: topSales.map((t) => t.variantId) } },
          select: { id: true, productId: true },
        })
      ).map((v) => [v.id, v.productId]),
    );
    const productIdsInOrder: string[] = [];
    for (const sale of topSales) {
      const productId = variantToProduct.get(sale.variantId);
      if (productId && !productIdsInOrder.includes(productId)) {
        productIdsInOrder.push(productId);
      }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIdsInOrder.slice(0, limit) }, isPublished: true },
      include: {
        variants: { where: { isActive: true }, include: { images: true } },
      },
    });
    // Preserva el orden de más vendido a menos vendido.
    products.sort(
      (a, b) => productIdsInOrder.indexOf(a.id) - productIdsInOrder.indexOf(b.id),
    );
    if (products.length > 0) return products;
  }

  const published = await getPublishedProducts();
  return published.filter((p) => p.variants.some((v) => v.images.length > 0)).slice(0, limit);
}

/**
 * Imagen para el hero del home y el popup de descuento. Se elige en vivo
 * entre los productos más vendidos (o cualquier producto con foto) en vez
 * de apuntar a un archivo fijo — así nunca queda una imagen rota si esa
 * foto en particular se borra desde el panel admin.
 */
export async function getHeroImage() {
  const bestSellers = await getBestSellers(6);
  for (const product of bestSellers) {
    for (const variant of product.variants) {
      if (variant.images[0]) {
        return { storagePath: variant.images[0].storagePath, alt: product.title };
      }
    }
  }
  return null;
}
