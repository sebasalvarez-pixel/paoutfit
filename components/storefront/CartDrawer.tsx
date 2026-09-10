"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatCop } from "@/lib/format";
import { useLocale } from "@/components/LocaleProvider";
import { translateColorName } from "@/lib/i18n/dictionary";

export function CartDrawer() {
  const { items, isOpen, close, removeItem, setQuantity } = useCartStore();
  const total = cartTotal(items);
  const { t, locale } = useLocale();

  return (
    <>
      {/* Fondo oscuro: aparece/desaparece con un fundido. */}
      <button
        aria-label={t("cart_cerrar_carrito")}
        tabIndex={isOpen ? 0 : -1}
        onClick={close}
        className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel: se desliza desde la derecha. */}
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-ivory flex flex-col shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-rose/15">
          <h2 className="font-heading text-xl">{t("cart_title")}</h2>
          <button
            onClick={close}
            aria-label={t("cart_cerrar")}
            className="text-ink/60 hover:text-ink hover:rotate-90 transition-transform duration-200"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-ink/60 text-sm mt-8 text-center">
              {t("cart_empty")}.
            </p>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4">
                  <div className="relative h-24 w-20 bg-blush shrink-0 overflow-hidden">
                    {item.imageSrc && (
                      <Image
                        src={item.imageSrc}
                        alt={item.productTitle}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-wide">
                      {item.productTitle}
                    </p>
                    <p className="text-xs text-ink/60 mt-1">
                      {t("cart_color")}: {translateColorName(locale, item.colorName)}
                    </p>
                    <p className="text-sm text-rose mt-1">
                      {formatCop(item.unitPriceCop)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          setQuantity(item.variantId, Number(e.target.value))
                        }
                        className="border border-ink/20 text-sm px-2 py-1"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ),
                        )}
                      </select>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-ink/50 hover:text-rose underline"
                      >
                        {t("cart_quitar")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-rose/15 px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span>{t("cart_subtotal")}</span>
              <span className="text-rose">{formatCop(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="block text-center bg-rose text-white py-3 uppercase text-sm tracking-wide hover:bg-plum active:scale-95 transition-all"
            >
              {t("cart_finalizar_compra")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
