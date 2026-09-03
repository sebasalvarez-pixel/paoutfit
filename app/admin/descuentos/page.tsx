import { prisma } from "@/lib/prisma";
import { createDiscountCode, toggleDiscountCode } from "./actions";

export default async function AdminDiscountsPage() {
  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-heading text-3xl text-ink">Códigos de descuento</h1>

      <form
        action={createDiscountCode}
        className="bg-white border border-ink/10 rounded p-5 flex flex-wrap items-end gap-4"
      >
        <div>
          <label className="text-xs text-ink/60">Código</label>
          <input
            name="code"
            required
            placeholder="VERANO10"
            className="w-full border border-ink/20 px-3 py-2 mt-1 uppercase"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60">Tipo</label>
          <select
            name="type"
            className="border border-ink/20 px-3 py-2 mt-1"
          >
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto fijo (COP)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/60">Valor</label>
          <input
            name="value"
            type="number"
            required
            className="w-28 border border-ink/20 px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60">Usos máximos (opcional)</label>
          <input
            name="maxUses"
            type="number"
            className="w-28 border border-ink/20 px-3 py-2 mt-1"
          />
        </div>
        <button
          type="submit"
          className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors"
        >
          Crear
        </button>
      </form>

      <div className="bg-white border border-ink/10 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-ink/10">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Usos</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr key={code.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium">{code.code}</td>
                <td className="px-4 py-3">
                  {code.type === "percentage" ? `${code.value}%` : `$${code.value}`}
                </td>
                <td className="px-4 py-3">
                  {code.usesCount}
                  {code.maxUses ? ` / ${code.maxUses}` : ""}
                </td>
                <td className="px-4 py-3">
                  {code.isActive ? (
                    <span className="text-emerald-700 text-xs">Activo</span>
                  ) : (
                    <span className="text-ink/40 text-xs">Inactivo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <form
                    action={toggleDiscountCode.bind(null, code.id, code.isActive)}
                  >
                    <button
                      type="submit"
                      className="text-xs text-rose hover:underline"
                    >
                      {code.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
