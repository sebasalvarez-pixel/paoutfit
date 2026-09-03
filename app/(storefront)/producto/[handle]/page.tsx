import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/products";
import { ProductDetail } from "@/components/storefront/ProductDetail";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};

  const description = product.descriptionHtml
    ? stripHtml(product.descriptionHtml).slice(0, 160)
    : undefined;
  const image = product.variants.find((v) => v.images[0])?.images[0];

  return {
    title: `${product.title} — PAOUTFIT`,
    description,
    openGraph: image
      ? { images: [{ url: image.storagePath }] }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
