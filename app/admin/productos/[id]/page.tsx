import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddVariantForm } from "@/components/admin/AddVariantForm";
import {
  deleteProductImage,
  updateProduct,
  updateVariant,
  uploadProductImage,
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
      variants: { include: { images: true }, orderBy: { colorName: "asc" } },
    },
  });
  if (!product) notFound();

  const boundUpdateProduct = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h1 className="font-heading text-3xl text-ink">{product.title}</h1>
        <p className="text-ink/50 text-sm">/{product.handle}</p>
      </div>

      <form action={boundUpdateProduct} className="space-y-4 bg-white border border-ink/10 rounded p-6">
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
          <label className="text-xs text-ink/60">Descripción (HTML)</label>
          <textarea
            name="descriptionHtml"
            defaultValue={product.descriptionHtml ?? ""}
            rows={5}
            className="w-full border border-ink/20 px-3 py-2 mt-1 font-mono text-xs"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-ink/60">Categoría</label>
            <select
              name="category"
              defaultValue={product.category}
              className="w-full border border-ink/20 px-3 py-2 mt-1"
            >
              <option value="Vestidos">Vestidos</option>
              <option value="Enterizos">Enterizos</option>
              <option value="Tops">Tops</option>
            </select>
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
      </form>

      <div>
        <h2 className="font-heading text-xl text-ink mb-4">
          Colores e inventario
        </h2>
        <div className="space-y-3">
          {product.variants.map((variant) => {
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
                <form
                  action={boundUpdateVariant}
                  className="flex flex-wrap items-end gap-4"
                >
                  <div>
                    <p className="text-xs text-ink/50">Color</p>
                    <p className="text-sm font-medium">{variant.colorName}</p>
                    <p className="text-[11px] text-ink/40">{variant.sku}</p>
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
                </form>
                <div className="flex gap-1 ml-auto">
                  {variant.images.map((img) => (
                    <div key={img.id} className="relative h-14 w-12 group">
                      <Image
                        src={img.storagePath}
                        alt={img.altText ?? ""}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                      <form action={deleteProductImage.bind(null, img.id)}>
                        <button
                          type="submit"
                          className="absolute inset-0 bg-black/50 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Borrar
                        </button>
                      </form>
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
        <form
          action={uploadProductImage}
          className="bg-white border border-ink/10 rounded p-4 flex flex-wrap items-end gap-4"
        >
          <input type="hidden" name="productId" value={product.id} />
          <div>
            <label className="text-xs text-ink/60">Color (opcional)</label>
            <select
              name="variantId"
              defaultValue=""
              className="border border-ink/20 px-2 py-2 mt-1 text-sm"
            >
              <option value="">General del producto</option>
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.colorName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-ink/60">Archivo</label>
            <input
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="block text-sm mt-1"
            />
          </div>
          <button
            type="submit"
            className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors"
          >
            Subir
          </button>
        </form>
      </div>
    </div>
  );
}
