import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/products";
import { ProductDetail } from "@/components/storefront/ProductDetail";

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
