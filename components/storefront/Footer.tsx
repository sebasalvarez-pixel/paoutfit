import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-plum text-blush mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid gap-10 sm:grid-cols-3">
        <div>
          <Image
            src="/brand/isotipo.png"
            alt="PAOUTFIT"
            width={35}
            height={40}
            className="mb-4"
          />
          <p className="text-sm tracking-widest uppercase text-blush/70">
            Move. Feel. Be You.
          </p>
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
          </ul>
        </div>
      </div>
      <div className="border-t border-blush/10 py-4 text-center text-xs text-blush/50">
        © {new Date().getFullYear()} PAOUTFIT — Todos los derechos reservados.
      </div>
    </footer>
  );
}
