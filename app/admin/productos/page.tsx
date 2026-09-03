import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCop } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-ink">Productos</h1>
      </div>

      <div className="bg-white border border-ink/10 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-ink/10">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Inventario total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (sum, v) => sum + v.inventoryQty,
                0,
              );
              return (
                <tr key={product.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">{product.title}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{formatCop(product.basePriceCop)}</td>
                  <td className="px-4 py-3">
                    <span className={totalStock === 0 ? "text-red-600" : ""}>
                      {totalStock} unidades
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.isPublished ? (
                      <span className="text-emerald-700 text-xs">Publicado</span>
                    ) : (
                      <span className="text-ink/40 text-xs">Oculto</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="text-rose hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
