import Image from "next/image";
import Link from "next/link";
import { getPublishedProducts, getCategories } from "@/lib/products";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function HomePage() {
  const products = await getPublishedProducts();
  const categories = getCategories();
  const featured = products.filter((p) =>
    p.variants.some((v) => v.images.length > 0),
  );

  return (
    <div>
      {/* Hero */}
      <section className="grid lg:grid-cols-2 min-h-[80vh]">
        <div className="order-2 lg:order-1 flex flex-col justify-center gap-6 px-8 py-16 lg:px-16">
          <p className="uppercase tracking-[0.3em] text-xs text-rose">
            Move. Feel. Be You.
          </p>
          <h1 className="font-heading text-5xl lg:text-6xl leading-tight text-ink">
            Ropa deportiva para moverte como eres
          </h1>
          <p className="text-ink/70 max-w-md">
            Diseños femeninos, cómodos y versátiles para entrenar, salir o
            simplemente ser tú.
          </p>
          <Link
            href="/coleccion/vestidos"
            className="inline-block w-fit bg-rose text-white px-8 py-3 uppercase text-sm tracking-wide hover:bg-plum transition-colors"
          >
            Ver colección
          </Link>
        </div>
        <div className="order-1 lg:order-2 relative min-h-[45vh]">
          <Image
            src="/products/nova-dress/nova-dress-vinotinto-frente.jpg"
            alt="PAOUTFIT"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid sm:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/coleccion/${cat.toLowerCase()}`}
            className="group relative aspect-[4/5] bg-blush overflow-hidden flex items-end"
          >
            <span className="relative z-10 w-full text-center pb-6 font-heading text-2xl text-ink group-hover:text-rose transition-colors">
              {cat}
            </span>
          </Link>
        ))}
      </section>

      {/* Destacados */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="font-heading text-3xl text-center text-ink mb-10">
          Los más comprados
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
