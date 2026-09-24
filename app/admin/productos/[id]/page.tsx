import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAllCategories } from "@/lib/categories";
import { htmlToText } from "@/lib/description";
import { AddVariantForm } from "@/components/admin/AddVariantForm";
import { UploadImageForm } from "@/components/admin/UploadImageForm";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { AdminForm } from "@/components/admin/AdminForm";
import {
  deleteProductImage,
  setCoverImage,
  setCoverVariant,
  updateProduct,
  updateVariant,
} from "./actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        include: { images: { orderBy: { position: "asc" } } },
        orderBy: { position: "asc" },
      },
    },
  });
  if (!product) notFound();

  const categories = await getAllCategories();
  const categoryNames = categories.map((c) => c.name);
  // Por si el producto tiene una categoría que ya no existe en la lista.
  if (!categoryNames.includes(product.category)) categoryNames.push(product.category);

  const boundUpdateProduct = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-10 max-w-3xl">
      <UnsavedChangesGuard />
      <div>
        <a
          href="/admin/productos"
          className="text-xs uppercase tracking-wide text-ink/50 hover:text-rose"
        >
          ← Volver a productos
        </a>
        <h1 className="font-heading text-3xl text-ink mt-2">{product.title}</h1>
        <p className="text-ink/50 text-sm">/{product.handle}</p>
      </div>

      <AdminForm
        action={boundUpdateProduct}
        successMessage="Producto guardado"
        className="space-y-4 bg-white border border-ink/10 rounded p-6"
      >
        <h2 className="text-xs uppercase tracking-wide text-ink/50">
          Información general
        </h2>
        <div>
          <label className="text-xs text-ink/60">Nombre</label>
          <input
            name="title"
            defaultValue={product.title}
            required
            className="w-full border border-ink/20 px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60">Descripción</label>
          <textarea
            name="descriptionHtml"
            defaultValue={htmlToText(product.descriptionHtml)}
            rows={7}
            placeholder="Escribe la descripción normal, como en un mensaje."
            className="w-full border border-ink/20 px-3 py-2 mt-1 text-sm leading-relaxed"
          />
          <p className="text-[11px] text-ink/40 mt-1">
            Deja una línea en blanco para separar párrafos. Si empiezas una
            línea con un guion (-), sale como lista con viñetas.
          </p>
        </div>
        <div className="border-t border-ink/10 pt-4">
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-3">
            Versión en inglés (para clientes internacionales)
          </p>
          <div>
            <label className="text-xs text-ink/60">Nombre (inglés)</label>
            <input
              name="titleEn"
              defaultValue={product.titleEn ?? ""}
              placeholder={product.title}
              className="w-full border border-ink/20 px-3 py-2 mt-1"
            />
          </div>
          <div className="mt-3">
            <label className="text-xs text-ink/60">Descripción (inglés)</label>
            <textarea
              name="descriptionHtmlEn"
              defaultValue={htmlToText(product.descriptionHtmlEn)}
              rows={7}
              className="w-full border border-ink/20 px-3 py-2 mt-1 text-sm leading-relaxed"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-ink/60">Categoría</label>
            <select
              name="category"
              defaultValue={product.category}
              className="w-full border border-ink/20 px-3 py-2 mt-1"
            >
              {categoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <a
              href="/admin/categorias"
              className="text-xs text-rose hover:underline mt-1 inline-block"
            >
              Crear o editar categorías
            </a>
          </div>
          <div>
            <label className="text-xs text-ink/60">Precio base (COP)</label>
            <input
              name="basePriceCop"
              type="number"
              defaultValue={product.basePriceCop}
              required
              className="w-full border border-ink/20 px-3 py-2 mt-1"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={product.isPublished}
          />
          Publicado (visible en la tienda)
        </label>
        <button
          type="submit"
          className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors"
        >
          Guardar cambios
        </button>
      </AdminForm>

      <div>
        <h2 className="font-heading text-xl text-ink mb-4">
          Colores e inventario
        </h2>
        <div className="space-y-3">
          {product.variants.map((variant, variantIndex) => {
            const boundUpdateVariant = updateVariant.bind(
              null,
              variant.id,
              product.handle,
            );
            return (
              <div
                key={variant.id}
                className="bg-white border border-ink/10 rounded p-4 flex flex-wrap items-end gap-4"
              >
                <AdminForm
                  action={boundUpdateVariant}
                  successMessage={`Color ${variant.colorName} guardado`}
                  className="flex flex-wrap items-end gap-4"
                >
                  <div>
                    <p className="text-xs text-ink/50">Color</p>
                    <p className="text-sm font-medium">
                      {variant.colorName}
                      {variantIndex === 0 && (
                        <span className="ml-2 bg-rose text-white text-[9px] px-1.5 py-0.5 align-middle">
                          Portada del producto
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-ink/40">{variant.sku}</p>
                    {variantIndex !== 0 && (
                      // Un formulario no puede ir dentro de otro: el botón
                      // apunta a un formulario aparte (más abajo) con "form".
                      <button
                        type="submit"
                        form={`cover-${variant.id}`}
                        className="text-[10px] text-ink/50 underline hover:text-rose mt-1"
                      >
                        Usar este color como portada
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-ink/60">Precio (COP)</label>
                    <input
                      name="priceCop"
                      type="number"
                      defaultValue={variant.priceCop}
                      className="w-32 border border-ink/20 px-2 py-1 mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink/60">Inventario</label>
                    <input
                      name="inventoryQty"
                      type="number"
                      defaultValue={variant.inventoryQty}
                      className="w-24 border border-ink/20 px-2 py-1 mt-1 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={variant.isActive}
                    />
                    Activo
                  </label>
                  <button
                    type="submit"
                    className="text-xs uppercase text-rose border border-rose px-3 py-2 hover:bg-rose hover:text-white transition-colors"
                  >
                    Guardar
                  </button>
                </AdminForm>
                {variantIndex !== 0 && (
                  <form
                    id={`cover-${variant.id}`}
                    action={setCoverVariant.bind(null, product.id, variant.id)}
                  />
                )}
                <div className="flex gap-1 ml-auto">
                  {variant.images.map((img, index) => (
                    <div key={img.id} className="relative h-14 w-12 group">
                      <Image
                        src={img.storagePath}
                        alt={img.altText ?? ""}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute top-0 left-0 bg-rose text-white text-[8px] px-1">
                          Portada
                        </span>
                      )}
                      <div className="absolute inset-0 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        {index !== 0 && (
                          <form action={setCoverImage.bind(null, img.id)} className="flex-1">
                            <button
                              type="submit"
                              className="w-full h-full bg-black/50 text-white text-[8px] leading-tight"
                            >
                              Marcar
                              <br />
                              portada
                            </button>
                          </form>
                        )}
                        <form action={deleteProductImage.bind(null, img.id)} className="flex-1">
                          <button
                            type="submit"
                            className="w-full h-full bg-black/70 text-white text-[9px]"
                          >
                            Borrar
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <AddVariantForm
            productId={product.id}
            defaultPriceCop={product.basePriceCop}
          />
        </div>
      </div>

      <div>
        <h2 className="font-heading text-xl text-ink mb-4">Subir foto</h2>
        <UploadImageForm
          productId={product.id}
          variants={product.variants.map((v) => ({ id: v.id, colorName: v.colorName }))}
        />
      </div>
    </div>
  );
}
