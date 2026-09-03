import Image from "next/image";
import Link from "next/link";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/paoutfit.col",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@paoutfit.col",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M14 3v10.5a3 3 0 1 1-2-2.83V3h2Zm0 0c.2 2 1.7 3.6 3.7 3.9V9c-1.4 0-2.6-.5-3.7-1.3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/573114857551",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 18l1.1-3.2A7 7 0 1 1 10 17.8L6 18Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="bg-plum text-blush mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid gap-10 sm:grid-cols-4">
        <div>
          <Image
            src="/brand/isotipo.png"
            alt="PAOUTFIT"
            width={35}
            height={40}
            className="mb-4"
          />
          <p className="text-sm tracking-widest uppercase text-blush/70 mb-4">
            Move. Feel. Be You.
          </p>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="hover:text-rose transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="text-sm">
          <h3 className="uppercase tracking-wide text-xs text-blush/60 mb-3">
            Comprar
          </h3>
          <ul className="space-y-2">
            <li>
              <Link href="/coleccion/vestidos" className="hover:text-rose">
                Vestidos
              </Link>
            </li>
            <li>
              <Link href="/coleccion/enterizos" className="hover:text-rose">
                Enterizos
              </Link>
            </li>
            <li>
              <Link href="/coleccion/tops" className="hover:text-rose">
                Tops
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h3 className="uppercase tracking-wide text-xs text-blush/60 mb-3">
            Ayuda
          </h3>
          <ul className="space-y-2">
            <li>
              <Link href="/informacion" className="hover:text-rose">
                Envíos y pagos
              </Link>
            </li>
            <li>
              <Link href="/informacion#cambios" className="hover:text-rose">
                Cambios y devoluciones
              </Link>
            </li>
            <li>
              <Link href="/rastrear-pedido" className="hover:text-rose">
                Rastrea tu pedido
              </Link>
            </li>
            <li>
              <Link href="/tratamiento-de-datos" className="hover:text-rose">
                Tratamiento de datos
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h3 className="uppercase tracking-wide text-xs text-blush/60 mb-3">
            Contáctanos
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://instagram.com/paoutfit.col"
                target="_blank"
                rel="noreferrer"
                className="hover:text-rose"
              >
                @paoutfit.col
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/573114857551"
                target="_blank"
                rel="noreferrer"
                className="hover:text-rose"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href="mailto:paoutfitwear@gmail.com"
                className="hover:text-rose"
              >
                paoutfitwear@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blush/10 py-4 text-center text-xs text-blush/50">
        © {new Date().getFullYear()} PAOUTFIT — Todos los derechos reservados.
      </div>
    </footer>
  );
}
