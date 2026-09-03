import Image from "next/image";
import Link from "next/link";
import {
  getBestSellers,
  getCategories,
  getCategoryImages,
  getHeroImage,
} from "@/lib/products";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function HomePage() {
  const categories = getCategories();
  const featured = await getBestSellers(4);
  const heroImage = await getHeroImage();
  const categoryImages = await getCategoryImages();

  return (
    <div>
      {/* Hero */}
      <section className="grid lg:grid-cols-2 min-h-[80vh]">
        <div className="order-2 lg:order-1 flex flex-col justify-center gap-6 px-8 py-16 lg:px-16">
          <p className="uppercase tracking-[0.3em] text-xs text-rose">
            Move. Feel. Be You.
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl leading-tight text-ink">
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
        <div className="order-1 lg:order-2 relative min-h-[45vh] bg-blush">
          {heroImage && (
            <Image
              src={heroImage.storagePath}
              alt={heroImage.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="object-cover"
            />
          )}
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid sm:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const image = categoryImages[cat];
          return (
            <Link
              key={cat}
              href={`/coleccion/${cat.toLowerCase()}`}
              className="group relative h-64 sm:h-80 overflow-hidden flex items-end bg-blush"
            >
              {image && (
                <>
                  <Image
                    src={image.storagePath}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                </>
              )}
              <span
                className={`relative z-10 w-full text-center pb-6 font-heading text-2xl transition-colors ${
                  image
                    ? "text-white drop-shadow"
                    : "text-ink group-hover:text-rose"
                }`}
              >
                {cat}
              </span>
            </Link>
          );
        })}
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
