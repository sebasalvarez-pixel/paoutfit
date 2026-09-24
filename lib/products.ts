import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Con "join" Prisma trae producto + colores + fotos en UNA sola consulta a la
// base de datos (en vez de una por cada nivel). La base está lejos del
// servidor, así que cada viaje de ida y vuelta cuenta.
const JOIN = "join" as const;

export async function getPublishedProducts() {
  return prisma.product.findMany({
    relationLoadStrategy: JOIN,
    where: { isPublished: true },
    include: {
      variants: {
        where: { isActive: true },
        include: { images: { orderBy: { position: "asc" } } },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProductsByCategory(category: string) {
  return prisma.product.findMany({
    relationLoadStrategy: JOIN,
    where: {
      isPublished: true,
      category: { equals: category, mode: "insensitive" },
    },
    include: {
      variants: {
        where: { isActive: true },
        include: { images: { orderBy: { position: "asc" } } },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProductByHandle(handle: string) {
  return prisma.product.findUnique({
    relationLoadStrategy: JOIN,
    where: { handle, isPublished: true },
    include: {
      variants: {
        where: { isActive: true },
        include: { images: { orderBy: { position: "asc" } } },
        orderBy: { position: "asc" },
      },
    },
  });
}

/**
 * IDs de productos ordenados de más a menos vendido, según ventas reales
 * (pedidos pagados o enviados). Una sola consulta; `cache` hace que el
 * layout y la página compartan el resultado dentro de la misma visita.
 */
const getSalesRanking = cache(async (): Promise<string[]> => {
  const rows = await prisma.$queryRaw<{ product_id: string; units: number }[]>`
    SELECT v.product_id, SUM(oi.quantity)::int AS units
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN product_variants v ON v.id = oi.variant_id
    WHERE o.status IN ('paid', 'fulfilled')
    GROUP BY v.product_id
    ORDER BY units DESC`;
  return rows.filter((r) => r.units > 0).map((r) => r.product_id);
});

/**
 * IDs de los productos "más vendidos": son los que llevan la estrella en el
 * catálogo. Mientras no haya ventas devuelve una lista vacía: no se marca
 * nada de forma falsa.
 */
export async function getBestSellerIds(limit = 3): Promise<string[]> {
  return (await getSalesRanking()).slice(0, limit);
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
 * vendidas de verdad. Mientras la tienda no tenga ventas todavía, muestra
 * los productos que ya tienen foto en vez de una sección vacía.
 */
export async function getBestSellers(limit = 4) {
  const ids = (await getSalesRanking()).slice(0, limit);

  if (ids.length > 0) {
    const products = await prisma.product.findMany({
      relationLoadStrategy: JOIN,
      where: { id: { in: ids }, isPublished: true },
      include: {
        variants: {
          where: { isActive: true },
          include: { images: { orderBy: { position: "asc" } } },
          orderBy: { position: "asc" },
        },
      },
    });
    // Preserva el orden de más vendido a menos vendido.
    products.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    if (products.length > 0) return products;
  }

  return prisma.product.findMany({
    relationLoadStrategy: JOIN,
    where: {
      isPublished: true,
      variants: { some: { images: { some: {} } } },
    },
    include: {
      variants: {
        where: { isActive: true },
        include: { images: { orderBy: { position: "asc" } } },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

/**
 * Imagen para el hero del home y el popup de descuento: la foto principal del
 * producto más vendido (o de cualquier producto con foto). Se elige en vivo
 * para que nunca quede una imagen rota si una foto se borra desde el panel.
 * Solo trae UNA fila, no todo el catálogo.
 */
export const getHeroImage = cache(async () => {
  const [topProductId] = await getSalesRanking();
  const order = [{ variant: { position: "asc" as const } }, { position: "asc" as const }];

  const image =
    (topProductId
      ? await prisma.productImage.findFirst({
          where: { product: { id: topProductId, isPublished: true } },
          orderBy: order,
          select: { storagePath: true, altText: true, product: { select: { title: true } } },
        })
      : null) ??
    (await prisma.productImage.findFirst({
      where: { product: { isPublished: true } },
      orderBy: [{ product: { createdAt: "asc" as const } }, ...order],
      select: { storagePath: true, altText: true, product: { select: { title: true } } },
    }));

  return image
    ? { storagePath: image.storagePath, alt: image.altText ?? image.product.title }
    : null;
});
