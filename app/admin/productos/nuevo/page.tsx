import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { createProduct } from "./actions";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <UnsavedChangesGuard />
      <div>
        <a
          href="/admin/productos"
          className="text-xs uppercase tracking-wide text-ink/50 hover:text-rose"
        >
          ← Volver a productos
        </a>
        <h1 className="font-heading text-3xl text-ink mt-2">Nuevo producto</h1>
        <p className="text-ink/50 text-sm mt-1">
          Se crea con un color inicial — luego puedes agregar más colores y
          fotos desde la ficha del producto.
        </p>
      </div>

      <form
        action={createProduct}
        className="space-y-4 bg-white border border-ink/10 rounded p-6"
      >
        <div>
          <label className="text-xs text-ink/60">Nombre del producto</label>
          <input
            name="title"
            required
            placeholder="Ej. Luna Dress"
            className="w-full border border-ink/20 px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60">Descripción (HTML)</label>
          <textarea
            name="descriptionHtml"
            rows={5}
            placeholder="<p>Descripción del producto...</p>"
            className="w-full border border-ink/20 px-3 py-2 mt-1 font-mono text-xs"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-ink/60">Categoría</label>
            <select
              name="category"
              defaultValue="Vestidos"
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
              min={1}
              required
              placeholder="90000"
              className="w-full border border-ink/20 px-3 py-2 mt-1"
            />
          </div>
        </div>

        <div className="border-t border-ink/10 pt-4">
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-3">
            Primer color
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink/60">Color</label>
              <input
                name="colorName"
                required
                placeholder="Ej. Negro"
                className="w-full border border-ink/20 px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-ink/60">Inventario inicial</label>
              <input
                name="inventoryQty"
                type="number"
                min={0}
                defaultValue={0}
                className="w-full border border-ink/20 px-3 py-2 mt-1"
              />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked />
          Publicado (visible en la tienda)
        </label>

        <button
          type="submit"
          className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors"
        >
          Crear producto
        </button>
      </form>
    </div>
  );
}
