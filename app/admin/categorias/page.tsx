import { prisma } from "@/lib/prisma";
import { getAllCategories } from "@/lib/categories";
import { CategoryImagePicker } from "@/components/admin/CategoryImagePicker";
import {
  createCategory,
  deleteCategory,
  moveCategory,
  toggleCategoryVisibility,
  updateCategory,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const [categories, counts, images] = await Promise.all([
    getAllCategories(),
    prisma.product.groupBy({ by: ["category"], _count: { _all: true } }),
    prisma.productImage.findMany({
      select: {
        storagePath: true,
        product: { select: { title: true, category: true } },
      },
      orderBy: [{ productId: "asc" }, { position: "asc" }],
    }),
  ]);
  const allPhotos = images.map((i) => ({
    url: i.storagePath,
    label: i.product.title,
    category: i.product.category,
  }));
  const countOf = (name: string) =>
    counts.find((c) => c.category === name)?._count._all ?? 0;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-ink">Categorías</h1>
        <p className="text-sm text-ink/60 mt-2">
          Las categorías organizan la tienda (menú, inicio y filtros). Una
          categoría visible aparece en el menú de la tienda aunque todavía
          no tenga productos (dirá "Próximamente"); si no la quieres mostrar
          aún, pulsa "Ocultar". Para meter un producto en una categoría, elígela
          en la ficha del producto.
        </p>
      </div>

      {ok && (
        <p className="bg-emerald-50 text-emerald-800 text-sm px-4 py-3 rounded">{ok}</p>
      )}
      {error && (
        <p className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded">{error}</p>
      )}

      <form
        action={createCategory}
        className="bg-white border border-ink/10 rounded p-5 grid sm:grid-cols-[1fr_1fr_auto] items-end gap-4"
      >
        <div>
          <label className="text-xs text-ink/60">Nombre de la nueva categoría</label>
          <input
            name="name"
            required
            placeholder="Ej. Leggings"
            className="w-full border border-ink/20 px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60">En inglés (opcional)</label>
          <input
            name="nameEn"
            placeholder="Ej. Leggings"
            className="w-full border border-ink/20 px-3 py-2 mt-1"
          />
        </div>
        <button
          type="submit"
          className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors"
        >
          Crear
        </button>
      </form>

      <ul className="space-y-3">
        {categories.map((category, index) => {
          const total = countOf(category.name);
          return (
            <li
              key={category.id}
              className="bg-white border border-ink/10 rounded p-4 space-y-3"
            >
              <form
                action={updateCategory.bind(null, category.id)}
                className="grid sm:grid-cols-[1fr_1fr_auto] items-end gap-3"
              >
                <div>
                  <label className="text-xs text-ink/60">Nombre</label>
                  <input
                    name="name"
                    defaultValue={category.name}
                    required
                    className="w-full border border-ink/20 px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink/60">En inglés</label>
                  <input
                    name="nameEn"
                    defaultValue={category.nameEn ?? ""}
                    className="w-full border border-ink/20 px-3 py-2 mt-1"
                  />
                </div>
                <button
                  type="submit"
                  className="border border-rose text-rose px-4 py-2 text-sm hover:bg-rose hover:text-white transition-colors"
                >
                  Guardar
                </button>
              </form>

              <CategoryImagePicker
                categoryId={category.id}
                currentUrl={category.imageUrl}
                photos={[
                  // Primero las fotos de esta categoría, luego las demás.
                  ...allPhotos.filter((p) => p.category === category.name),
                  ...allPhotos.filter((p) => p.category !== category.name),
                ].map(({ url, label }) => ({ url, label }))}
              />

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="text-ink/60">
                  {total} producto{total === 1 ? "" : "s"} ·{" "}
                  {category.isVisible ? (
                    <span className="text-emerald-700">Visible</span>
                  ) : (
                    <span className="text-ink/40">Oculta</span>
                  )}
                </span>
                <span className="text-ink/30 hidden sm:inline">/coleccion/{category.slug}</span>

                <span className="flex items-center gap-3 sm:ml-auto">
                  <form action={moveCategory.bind(null, category.id, "up")}>
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label="Subir"
                      className="px-2 py-1 border border-ink/20 disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveCategory.bind(null, category.id, "down")}>
                    <button
                      type="submit"
                      disabled={index === categories.length - 1}
                      aria-label="Bajar"
                      className="px-2 py-1 border border-ink/20 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                  <form action={toggleCategoryVisibility.bind(null, category.id)}>
                    <button type="submit" className="text-rose hover:underline">
                      {category.isVisible ? "Ocultar" : "Mostrar"}
                    </button>
                  </form>
                  {total === 0 && (
                    <form action={deleteCategory.bind(null, category.id)}>
                      <button type="submit" className="text-red-600 hover:underline">
                        Eliminar
                      </button>
                    </form>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
