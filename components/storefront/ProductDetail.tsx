"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { formatCop } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import type {
  Product,
  ProductVariant,
  ProductImage,
} from "@/app/generated/prisma/client";

type ProductWithVariants = Product & {
  variants: (ProductVariant & { images: ProductImage[] })[];
};

export function ProductDetail({ product }: { product: ProductWithVariants }) {
  const variantsWithImages = product.variants.filter(
    (v) => v.images.length > 0,
  );
  // Los colores vienen ordenados con la portada elegida de primero; se
  // respeta ese orden al abrir la página aunque ese color esté agotado.
  const initialVariant = variantsWithImages[0] ?? product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialVariant?.id,
  );
  // Antes de elegir un color se ven todas las fotos del producto
  // mezcladas; al hacer clic en un color, se filtra a solo esas fotos.
  const [filterByColor, setFilterByColor] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId),
    [product.variants, selectedVariantId],
  );

  const allImages = useMemo(
    () => product.variants.flatMap((v) => v.images),
    [product.variants],
  );

  const images = filterByColor ? (selectedVariant?.images ?? []) : allImages;
  const activeImage = images[activeImageIndex] ?? images[0];

  function handleSelectVariant(id: string) {
    setSelectedVariantId(id);
    setFilterByColor(true);
    setActiveImageIndex(0);
    setAdded(false);
  }

  function goToImage(offset: number) {
    if (images.length < 2) return;
    setActiveImageIndex((i) => (i + offset + images.length) % images.length);
  }

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productHandle: product.handle,
      productTitle: product.title,
      colorName: selectedVariant.colorName,
      unitPriceCop: selectedVariant.priceCop,
      imageSrc: selectedVariant.images[0]?.storagePath ?? null,
    });
    setAdded(true);
  }

  const outOfStock = !selectedVariant || selectedVariant.inventoryQty <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-2 gap-12">
      {/* Galería */}
      <div>
        <div className="relative aspect-[3/4] bg-blush overflow-hidden group">
          {activeImage ? (
            <Image
              key={activeImage.id}
              src={activeImage.storagePath}
              alt={activeImage.altText ?? product.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-ink/30 uppercase text-sm">
              Foto próximamente
            </div>
          )}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goToImage(-1)}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full flex items-center justify-center bg-white/80 text-ink text-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goToImage(1)}
                aria-label="Foto siguiente"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full flex items-center justify-center bg-white/80 text-ink text-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                ›
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((img, i) => (
                  <span
                    key={img.id}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      i === activeImageIndex ? "bg-rose" : "bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-3 mt-4">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(i)}
                className={`relative h-20 w-16 bg-blush overflow-hidden border ${
                  i === activeImageIndex ? "border-rose" : "border-transparent"
                }`}
              >
                <Image
                  src={img.storagePath}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h1 className="font-heading text-3xl text-ink">{product.title}</h1>
        <p className="text-rose text-xl mt-2">
          {formatCop(selectedVariant?.priceCop ?? product.basePriceCop)}
        </p>

        <div
          className="prose prose-sm text-ink/70 mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml ?? "" }}
        />

        <div className="mt-8">
          <p className="text-xs uppercase tracking-wide text-ink/60 mb-3">
            Color: {selectedVariant?.colorName}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => handleSelectVariant(variant.id)}
                disabled={variant.inventoryQty <= 0}
                title={variant.colorName}
                className={`px-3 py-2 text-xs uppercase border transition-colors ${
                  variant.id === selectedVariantId
                    ? "border-rose text-rose"
                    : "border-ink/20 text-ink/70 hover:border-ink/50"
                } ${variant.inventoryQty <= 0 ? "opacity-30 line-through" : ""}`}
              >
                {variant.colorName}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="mt-8 w-full sm:w-auto px-10 py-3 bg-rose text-white uppercase text-sm tracking-wide hover:bg-plum active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {outOfStock
            ? "Agotado"
            : added
              ? "¡Agregado! Agregar otra vez"
              : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
