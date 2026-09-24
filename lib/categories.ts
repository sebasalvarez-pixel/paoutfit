import "server-only";
import { prisma } from "@/lib/prisma";

/** Lo mínimo que necesitan los componentes del cliente para mostrar una categoría. */
export type StoreCategory = {
  name: string;
  nameEn: string | null;
  slug: string;
  /** Foto elegida a mano en el panel; si no hay, se usa una automática. */
  imageUrl: string | null;
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
  return categories.map(({ name, nameEn, slug, imageUrl }) => ({
    name,
    nameEn,
    slug,
    imageUrl,
  }));
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug: slug.toLowerCase() } });
}

/**
 * Una foto representativa por categoría (para las tarjetas del home): la
 * elegida a mano en el panel o, si no hay, la primera de sus productos.
 * Devuelve null si no hay ninguna.
 */
export async function getCategoryImages(categories: StoreCategory[]) {
  const result: Record<string, { storagePath: string; alt: string } | null> = {};
  const needAuto = categories.filter((c) => !c.imageUrl);

  // Una sola consulta con las fotos de todos los productos publicados, en el
  // mismo orden de siempre (producto más antiguo, color principal, primera
  // foto); luego se toma la primera de cada categoría.
  const photos =
    needAuto.length > 0
      ? await prisma.productImage.findMany({
          where: {
            product: { isPublished: true, category: { in: needAuto.map((c) => c.name) } },
          },
          orderBy: [
            { product: { createdAt: "asc" } },
            { variant: { position: "asc" } },
            { position: "asc" },
          ],
          select: {
            storagePath: true,
            product: { select: { title: true, category: true } },
          },
        })
      : [];

  for (const category of categories) {
    if (category.imageUrl) {
      result[category.slug] = { storagePath: category.imageUrl, alt: category.name };
      continue;
    }
    const photo = photos.find((p) => p.product.category === category.name);
    result[category.slug] = photo
      ? { storagePath: photo.storagePath, alt: photo.product.title }
      : null;
  }

  return result;
}
