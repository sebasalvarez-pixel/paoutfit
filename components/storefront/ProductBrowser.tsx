"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Reveal } from "@/components/Reveal";
import { useLocale } from "@/components/LocaleProvider";
import { translateColorName } from "@/lib/i18n/dictionary";
import { categoryLabel } from "@/lib/category-label";
import { colorHexFor } from "@/lib/colors";
import type { StoreCategory } from "@/lib/categories";
import type {
  Product,
  ProductVariant,
  ProductImage,
} from "@/app/generated/prisma/client";

type ProductWithVariants = Product & {
  variants: (ProductVariant & { images: ProductImage[] })[];
};

type SortKey = "newest" | "price_asc" | "price_desc" | "best";

// Para comparar sin importar mayúsculas ni tildes ("Café" = "cafe").
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Catálogo con búsqueda rápida, filtro por color, disponibilidad, categoría
 * (cuando se ven todos los productos) y orden. Filtra en el navegador: el
 * catálogo es pequeño, así responde al instante sin recargar la página.
 */
export function ProductBrowser({
  products,
  bestSellerIds,
  categories,
  initialQuery = "",
  autoFocusSearch = false,
}: {
  products: ProductWithVariants[];
  bestSellerIds: string[];
  /** Si se pasa, se muestra el filtro por categoría. */
  categories?: StoreCategory[];
  initialQuery?: string;
  autoFocusSearch?: boolean;
}) {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("newest");
  const [colors, setColors] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableColors = useMemo(() => {
    const seen = new Map<string, { name: string; hex: string | null }>();
    for (const p of products) {
      for (const v of p.variants) {
        const key = normalize(v.colorName);
        if (!seen.has(key)) seen.set(key, { name: v.colorName, hex: v.colorHex });
      }
    }
    return [...seen.entries()].map(([key, value]) => ({ key, ...value }));
  }, [products]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    const filtered = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (onlyInStock && !p.variants.some((v) => v.inventoryQty > 0)) return false;
      if (
        colors.length > 0 &&
        !p.variants.some((v) => colors.includes(normalize(v.colorName)))
      ) {
        return false;
      }
      if (q) {
        const haystack = normalize(
          [
            p.title,
            p.titleEn ?? "",
            p.category,
            ...p.variants.flatMap((v) => [
              v.colorName,
              translateColorName("en", v.colorName),
            ]),
          ].join(" "),
        );
        // Cada palabra escrita debe aparecer en algún lado del producto.
        if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sort === "price_asc") sorted.sort((a, b) => a.basePriceCop - b.basePriceCop);
    else if (sort === "price_desc") sorted.sort((a, b) => b.basePriceCop - a.basePriceCop);
    else if (sort === "best") {
      const rank = (id: string) => {
        const i = bestSellerIds.indexOf(id);
        return i === -1 ? Infinity : i;
      };
      sorted.sort((a, b) => rank(a.id) - rank(b.id));
    }
    return sorted;
  }, [products, query, sort, colors, category, onlyInStock, bestSellerIds]);

  const activeFilterCount =
    colors.length + (onlyInStock ? 1 : 0) + (category ? 1 : 0) + (query.trim() ? 1 : 0);

  function toggleColor(key: string) {
    setColors((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  }

  function clearAll() {
    setQuery("");
    setColors([]);
    setCategory("");
    setOnlyInStock(false);
    setSort("newest");
  }

  return (
    <div>
      {/* Búsqueda + orden */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
          >
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("filtro_buscar_placeholder")}
            aria-label={t("nav_buscar")}
            autoFocus={autoFocusSearch}
            className="w-full border border-ink/20 bg-white pl-10 pr-3 py-3 text-base sm:text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="sm:hidden flex-1 border border-ink/20 bg-white px-4 py-3 text-sm"
          >
            {t("filtro_filtros")}
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label={t("filtro_ordenar")}
            className="flex-1 sm:flex-none border border-ink/20 bg-white px-3 py-3 text-base sm:text-sm"
          >
            <option value="newest">{t("filtro_orden_novedades")}</option>
            <option value="best">{t("filtro_orden_vendidos")}</option>
            <option value="price_asc">{t("filtro_orden_precio_asc")}</option>
            <option value="price_desc">{t("filtro_orden_precio_desc")}</option>
          </select>
        </div>
      </div>

      {/* Filtros: siempre visibles en pantallas grandes, plegables en celular */}
      <div className={`${filtersOpen ? "block" : "hidden"} sm:block space-y-4 mb-6`}>
        {categories && categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-ink/50 mr-1">
              {t("filtro_categoria")}
            </span>
            <button
              type="button"
              onClick={() => setCategory("")}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                category === ""
                  ? "border-rose bg-rose text-white"
                  : "border-ink/20 bg-white text-ink/70 hover:border-ink/50"
              }`}
            >
              {t("filtro_todas")}
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(category === c.name ? "" : c.name)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  category === c.name
                    ? "border-rose bg-rose text-white"
                    : "border-ink/20 bg-white text-ink/70 hover:border-ink/50"
                }`}
              >
                {categoryLabel(c, locale)}
              </button>
            ))}
          </div>
        )}

        {availableColors.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-ink/50 mr-1">
              {t("filtro_colores")}
            </span>
            {availableColors.map((c) => {
              const selected = colors.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleColor(c.key)}
                  aria-pressed={selected}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs border transition-colors ${
                    selected
                      ? "border-rose ring-1 ring-rose bg-white text-ink"
                      : "border-ink/20 bg-white text-ink/70 hover:border-ink/50"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-ink/20"
                    style={{ backgroundColor: colorHexFor(c.name, c.hex) }}
                  />
                  {translateColorName(locale, c.name)}
                </button>
              );
            })}
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-ink/80 w-fit cursor-pointer">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
            className="h-4 w-4"
          />
          {t("filtro_solo_disponibles")}
        </label>
      </div>

      <div className="flex items-center justify-between mb-6 text-sm text-ink/60">
        <span>
          {visible.length}{" "}
          {visible.length === 1
            ? t("filtro_resultados_uno")
            : t("filtro_resultados_varios")}
        </span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-rose underline underline-offset-2"
          >
            {t("filtro_limpiar")}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-ink/50 py-16">{t("filtro_sin_resultados")}</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
          {visible.map((product, index) => (
            <Reveal key={product.id} delay={(index % 4) * 80}>
              <ProductCard
                product={product}
                bestSeller={bestSellerIds.includes(product.id)}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
