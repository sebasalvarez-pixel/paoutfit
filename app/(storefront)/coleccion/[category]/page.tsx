import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBestSellerIds, getProductsByCategory, getPublishedProducts } from "@/lib/products";
import { getCategoryBySlug, getStoreCategories } from "@/lib/categories";
import { categoryLabel } from "@/lib/category-label";
import { ProductBrowser } from "@/components/storefront/ProductBrowser";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionary";

// "todos" no es una categoría guardada: muestra todo el catálogo.
const ALL_SLUG = "todos";

// Igual que el home: el catálogo cambia desde el panel admin y debe
// verse al día sin depender de que una re-validación llegue a tiempo.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  if (slug.toLowerCase() === ALL_SLUG) {
    return {
      title: "Todos los productos — PAOUTFIT",
      description:
        "Toda la colección PAOUTFIT: ropa deportiva y athleisure para mujer, cómoda y con estilo.",
    };
  }
  const category = await getCategoryBySlug(slug);
  if (!category || !category.isVisible) return {};
  return {
    title: `${category.name} — PAOUTFIT`,
    description: `Descubre nuestra colección de ${category.name.toLowerCase()}: ropa deportiva y athleisure para mujer, cómoda y con estilo.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const isAll = slug.toLowerCase() === ALL_SLUG;
  const locale = await getLocale();

  const category = isAll ? null : await getCategoryBySlug(slug);
  if (!isAll && (!category || !category.isVisible)) notFound();

  const [products, bestSellerIds, storeCategories] = await Promise.all([
    category ? getProductsByCategory(category.name) : getPublishedProducts(),
    getBestSellerIds(),
    isAll ? getStoreCategories() : Promise.resolve(undefined),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl text-center text-ink mb-8">
        {category ? categoryLabel(category, locale) : t(locale, "todos_titulo")}
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-ink/50">{t(locale, "category_empty")}</p>
      ) : (
        <ProductBrowser
          products={products}
          bestSellerIds={bestSellerIds}
          categories={storeCategories}
        />
      )}
    </div>
  );
}
