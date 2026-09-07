"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "./AdminNav";

// El menú lateral solo se ve en pantallas grandes (`hidden md:block` en el
// layout); en el celular hace falta esta barra con menú desplegable para
// poder moverse entre secciones del panel.
export function AdminMobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden border-b border-ink/10 bg-white sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href="/admin"
          className="flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <Image src="/brand/isotipo.png" alt="PAOUTFIT" width={22} height={25} />
          <span className="font-heading text-base text-ink">Panel</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
          className="text-ink p-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>
      {open && (
        <div className="px-4 pb-4" onClick={() => setOpen(false)}>
          <AdminNav />
          <Link
            href="/"
            className="block mt-4 text-xs text-ink/50 hover:text-rose"
          >
            ← Ver tienda
          </Link>
        </div>
      )}
    </div>
  );
}
