import "server-only";
import { prisma } from "@/lib/prisma";
import { getProductsByCategory } from "@/lib/products";

/** Lo mínimo que necesitan los componentes del cliente para mostrar una categoría. */
export type StoreCategory = {
  name: string;
  nameEn: string | null;
  slug: string;
};

/** Todas las categorías (para el panel admin y los selectores de producto). */
export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: [{ position: "asc" }, { name: "asc" }] });
}

/**
 * Categorías que se muestran en la tienda: visibles y con al menos un
 * producto publicado. Así una categoría nueva y vacía (por ejemplo
 * "Conjuntos" antes de subir el primero) no deja una página vacía en el
 * menú; aparece sola en cuanto se publica el primer producto.
 */
export async function getStoreCategories(): Promise<StoreCategory[]> {
  const [categories, counts] = await Promise.all([
    prisma.category.findMany({
      where: { isVisible: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    }),
    prisma.product.groupBy({
      by: ["category"],
      where: { isPublished: true },
      _count: { _all: true },
    }),
  ]);
  const withProducts = new Set(counts.map((c) => c.category));
  return categories
    .filter((c) => withProducts.has(c.name))
    .map(({ name, nameEn, slug }) => ({ name, nameEn, slug }));
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug: slug.toLowerCase() } });
}

/**
 * Una foto representativa por categoría (para las tarjetas del home).
 * Devuelve null si esa categoría todavía no tiene ningún producto con foto.
 */
export async function getCategoryImages(categories: StoreCategory[]) {
  const result: Record<string, { storagePath: string; alt: string } | null> = {};

  await Promise.all(
    categories.map(async (category) => {
      const products = await getProductsByCategory(category.name);
      let found: { storagePath: string; alt: string } | null = null;
      for (const product of products) {
        const image = product.variants.find((v) => v.images[0])?.images[0];
        if (image) {
          found = { storagePath: image.storagePath, alt: product.title };
          break;
        }
      }
      result[category.slug] = found;
    }),
  );

  return result;
}
