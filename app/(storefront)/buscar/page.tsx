import type { Metadata } from "next";
import { getBestSellerIds, getPublishedProducts } from "@/lib/products";
import { getStoreCategories } from "@/lib/categories";
import { ProductBrowser } from "@/components/storefront/ProductBrowser";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buscar — PAOUTFIT",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const locale = await getLocale();
  const [products, bestSellerIds, categories] = await Promise.all([
    getPublishedProducts(),
    getBestSellerIds(),
    getStoreCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl text-center text-ink mb-8">
        {t(locale, "buscar_titulo")}
      </h1>
      <ProductBrowser
        products={products}
        bestSellerIds={bestSellerIds}
        categories={categories}
        initialQuery={q ?? ""}
        autoFocusSearch
      />
    </div>
  );
}
