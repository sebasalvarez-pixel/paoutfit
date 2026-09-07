"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatCop } from "@/lib/format";
import type { Product, ProductVariant, ProductImage } from "@/app/generated/prisma/client";

type ProductWithVariants = Product & {
  variants: (ProductVariant & { images: ProductImage[] })[];
};

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const hasStock = product.variants.some((v) => v.inventoryQty > 0);
  // Los colores vienen ordenados con la portada elegida de primero; se
  // respeta ese orden aunque ese color en particular esté agotado (el
  // producto ya se marca "Agotado" aparte si NINGÚN color tiene stock).
  const variant = product.variants.find((v) => v.images[0]);

  // Las fotos ya vienen ordenadas por posición (la portada elegida
  // siempre de primera); esa es la que se ve al volver del hover.
  const images = variant?.images ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCycling() {
    if (images.length < 2) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, 900);
  }

  function stopCycling() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActiveIndex(0);
  }

  useEffect(() => () => stopCycling(), []);

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <Link
      href={`/producto/${product.handle}`}
      className="group block"
      onMouseEnter={startCycling}
      onMouseLeave={stopCycling}
    >
      <div className="relative aspect-[3/4] bg-blush overflow-hidden">
        {activeImage ? (
          <Image
            src={activeImage.storagePath}
            alt={activeImage.altText ?? product.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-all duration-500 ease-out group-hover:scale-110"
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
        {activeImage && hasStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 group-hover:bg-ink/15 transition-colors duration-300">
            <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white text-ink text-xs uppercase tracking-wide px-5 py-2">
              Ver producto
            </span>
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {images.map((img, i) => (
              <span
                key={img.id}
                className={`h-1 w-1 rounded-full transition-colors ${
                  i === activeIndex ? "bg-rose" : "bg-white/70"
                }`}
              />
            ))}
          </div>
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
