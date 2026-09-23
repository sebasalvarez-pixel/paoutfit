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
 * Categorías que se muestran en la tienda: todas las marcadas como
 * visibles, tengan o no productos todavía (una categoría vacía muestra
 * "Próximamente"). Para esconder una, se usa "Ocultar" en el panel.
 */
export async function getStoreCategories(): Promise<StoreCategory[]> {
  const categories = await prisma.category.findMany({
    where: { isVisible: true },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });
  return categories.map(({ name, nameEn, slug }) => ({ name, nameEn, slug }));
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
