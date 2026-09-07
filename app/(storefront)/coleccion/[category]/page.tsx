import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProductsByCategory } from "@/lib/products";
import { ProductCard } from "@/components/storefront/ProductCard";

const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  getCategories().map((c) => [c.toLowerCase(), c]),
);

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.toLowerCase() }));
}

// Igual que el home: el catálogo cambia desde el panel admin y debe
// verse al día sin depender de que una re-validación llegue a tiempo.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = SLUG_TO_CATEGORY[slug.toLowerCase()];
  if (!category) return {};
  return {
    title: `${category} — PAOUTFIT`,
    description: `Descubre nuestra colección de ${category.toLowerCase()}: ropa deportiva y athleisure para mujer, cómoda y con estilo.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = SLUG_TO_CATEGORY[slug.toLowerCase()];
  if (!category) notFound();

  const products = await getProductsByCategory(category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl text-center text-ink mb-2">
        {category}
      </h1>
      <p className="text-center text-ink/60 text-sm mb-10">
        {products.length} producto{products.length === 1 ? "" : "s"}
      </p>

      {products.length === 0 ? (
        <p className="text-center text-ink/50">
          Pronto vas a encontrar productos aquí.
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
