import Link from "next/link";
import {
  getDashboardStats,
  getRevenueByDay,
  RANGE_LABEL,
  type DashboardRange,
} from "@/lib/admin-data";
import { formatCop } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { RevenueChart } from "@/components/admin/RevenueChart";

const RANGES: DashboardRange[] = ["today", "week", "month", "all"];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range: DashboardRange = RANGES.includes(rawRange as DashboardRange)
    ? (rawRange as DashboardRange)
    : "month";

  const [stats, revenueByDay] = await Promise.all([
    getDashboardStats(range),
    getRevenueByDay(14),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-3xl text-ink">Dashboard</h1>
        <p className="text-ink/60 text-sm mt-1">
          Resumen de tu tienda PAOUTFIT.
        </p>
      </div>

      {stats.pendingDispatchToday > 0 && (
        <Link
          href="/admin/pedidos?dispatch=today"
          className="block bg-rose text-white px-5 py-4 rounded hover:bg-plum transition-colors"
        >
          📦 Tienes <strong>{stats.pendingDispatchToday}</strong> pedido
          {stats.pendingDispatchToday === 1 ? "" : "s"} pagado
          {stats.pendingDispatchToday === 1 ? "" : "s"} hoy listo
          {stats.pendingDispatchToday === 1 ? "" : "s"} para despachar
          {stats.pendingDispatchTotal > stats.pendingDispatchToday && (
            <>
              {" "}
              (y {stats.pendingDispatchTotal - stats.pendingDispatchToday} más
              de días anteriores)
            </>
          )}
          {" "}→
        </Link>
      )}

      <div className="flex gap-2 text-xs">
        {RANGES.map((r) => (
          <Link
            key={r}
            href={`/admin?range=${r}`}
            className={`px-3 py-1 rounded-full border ${
              range === r
                ? "bg-rose text-white border-rose"
                : "border-ink/20 text-ink/60"
            }`}
          >
            {RANGE_LABEL[r]}
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label={`Ingresos — ${RANGE_LABEL[range].toLowerCase()}`}
          value={formatCop(stats.totalRevenueCop)}
          hint="Pedidos pagados o enviados"
        />
        <StatCard
          label="Pedidos pagados"
          value={String(stats.paidOrderCount)}
        />
        <StatCard
          label="Valor promedio"
          value={formatCop(stats.avgOrderValueCop)}
        />
      </div>

      <RevenueChart data={revenueByDay} />

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-heading text-xl text-ink mb-4">
            Productos más vendidos
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-ink/50">Aún no hay ventas.</p>
          ) : (
            <ul className="divide-y divide-ink/10 bg-white border border-ink/10 rounded">
              {stats.topProducts.map((p) => (
                <li
                  key={p.title}
                  className="px-4 py-3 flex justify-between text-sm"
                >
                  <span>{p.title}</span>
                  <span className="text-rose font-medium">
                    {p.quantity} vendidos
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="font-heading text-xl text-ink mb-4">
            ¿De dónde vienen tus ventas?
          </h2>
          {stats.trafficSources.length === 0 ? (
            <p className="text-sm text-ink/50">Aún no hay ventas.</p>
          ) : (
            <ul className="divide-y divide-ink/10 bg-white border border-ink/10 rounded">
              {stats.trafficSources.map((s) => (
                <li
                  key={s.source}
                  className="px-4 py-3 flex justify-between text-sm"
                >
                  <span className="capitalize">{s.source}</span>
                  <span className="text-rose font-medium">
                    {s.count} pedido{s.count === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl text-ink">
            Pedidos recientes {range !== "all" && `— ${RANGE_LABEL[range].toLowerCase()}`}
          </h2>
          <Link
            href="/admin/pedidos"
            className="text-sm text-rose hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="bg-white border border-ink/10 rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink/50 border-b border-ink/10">
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3 hidden sm:table-cell">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-rose hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {order.customerName}
                    <span className="block sm:hidden mt-1">
                      <OrderStatusBadge status={order.status} />
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCop(order.totalCop)}
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink/50">
                    No hay pedidos en este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
