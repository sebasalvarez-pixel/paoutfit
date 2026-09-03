import Image from "next/image";
import Link from "next/link";
import { formatCop } from "@/lib/format";
import type { Product, ProductVariant, ProductImage } from "@/app/generated/prisma/client";

type ProductWithVariants = Product & {
  variants: (ProductVariant & { images: ProductImage[] })[];
};

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const hasStock = product.variants.some((v) => v.inventoryQty > 0);
  const firstImage = (
    product.variants.find((v) => v.inventoryQty > 0 && v.images[0]) ??
    product.variants.find((v) => v.images[0])
  )?.images[0];

  return (
    <Link href={`/producto/${product.handle}`} className="group block">
      <div className="relative aspect-[3/4] bg-blush overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage.storagePath}
            alt={firstImage.altText ?? product.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-ink/30 text-sm uppercase tracking-wide">
            Próximamente
          </div>
        )}
        {!hasStock && (
          <span className="absolute top-3 left-3 bg-plum text-blush text-[10px] uppercase tracking-wide px-2 py-1">
            Agotado
          </span>
        )}
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-sm uppercase tracking-wide text-ink">
          {product.title}
        </h3>
        <p className="text-sm text-rose mt-1">
          {formatCop(product.basePriceCop)}
        </p>
      </div>
    </Link>
  );
}
