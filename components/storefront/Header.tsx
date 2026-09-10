"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { useLocale } from "@/components/LocaleProvider";
import { LanguageToggle } from "@/components/LanguageToggle";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.open);
  const count = cartCount(items);
  const { t } = useLocale();

  const CATEGORIES = [
    { label: t("nav_vestidos"), href: "/coleccion/vestidos" },
    { label: t("nav_enterizos"), href: "/coleccion/enterizos" },
    { label: t("nav_tops"), href: "/coleccion/tops" },
  ];

  return (
    <header className="border-b border-rose/15 bg-ivory/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <button
          type="button"
          className="lg:hidden text-ink"
          aria-label={t("nav_abrir_menu")}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <nav className="hidden lg:flex gap-8 text-sm tracking-wide uppercase">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="text-ink/80 hover:text-rose transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="flex items-center">
          <Image
            src="/brand/logo.svg"
            alt="PAOUTFIT"
            width={140}
            height={97}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-5">
          <LanguageToggle />
          <Link
            href="/rastrear-pedido"
            className="hidden sm:inline text-xs tracking-wide uppercase text-ink/70 hover:text-rose transition-colors"
          >
            {t("nav_mi_pedido")}
          </Link>
          <button
            type="button"
            aria-label={t("nav_ver_carrito")}
            onClick={openCart}
            className="relative text-ink hover:text-rose transition-all duration-200 hover:scale-110 active:scale-90"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 8h12l-1 12H7L6 8Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9 8V6a3 3 0 0 1 6 0v2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            {count > 0 && (
              <span
                key={count}
                className="absolute -top-2 -right-2 bg-rose text-white text-[10px] leading-none rounded-full h-4 w-4 flex items-center justify-center animate-badge-pop"
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-rose/15 px-4 py-4 flex flex-col gap-4 text-sm tracking-wide uppercase">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              onClick={() => setMenuOpen(false)}
              className="text-ink/80 hover:text-rose transition-colors"
            >
              {cat.label}
            </Link>
          ))}
          <Link
            href="/rastrear-pedido"
            onClick={() => setMenuOpen(false)}
            className="text-ink/80 hover:text-rose transition-colors"
          >
            {t("nav_mi_pedido")}
          </Link>
        </nav>
      )}
    </header>
  );
}
