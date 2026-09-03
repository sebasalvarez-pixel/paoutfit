import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-ivory text-center px-4">
      <Image
        src="/brand/isotipo.png"
        alt="PAOUTFIT"
        width={49}
        height={56}
      />
      <h1 className="font-heading text-4xl text-ink">Página no encontrada</h1>
      <p className="text-ink/60 max-w-sm">
        No encontramos lo que buscabas. Puede que el producto ya no esté
        disponible o el enlace esté mal escrito.
      </p>
      <Link
        href="/"
        className="bg-rose text-white px-8 py-3 uppercase text-sm tracking-wide hover:bg-plum transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
