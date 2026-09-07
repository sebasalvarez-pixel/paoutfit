import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCop } from "@/lib/format";
import { OrderStatusBadge, STATUS_LABEL } from "@/components/admin/OrderStatusBadge";
import { rangeStart, RANGE_LABEL, type DashboardRange } from "@/lib/admin-data";

const STATUSES = [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "fulfilled",
  "refunded",
] as const;

const RANGES: DashboardRange[] = ["today", "week", "month", "all"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; range?: string; dispatch?: string }>;
}) {
  const params = await searchParams;

  // Atajo desde el dashboard: "pedidos de hoy por despachar" = pagados + hoy.
  const isDispatchToday = params.dispatch === "today";
  const status = isDispatchToday ? "paid" : params.status;
  const range: DashboardRange = isDispatchToday
    ? "today"
    : RANGES.includes(params.range as DashboardRange)
      ? (params.range as DashboardRange)
      : "all";

  const since = rangeStart(range);

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as (typeof STATUSES)[number] } : {}),
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  function buildHref(overrides: { status?: string; range?: DashboardRange }) {
    const q = new URLSearchParams();
    const newStatus = "status" in overrides ? overrides.status : status;
    const newRange = "range" in overrides ? overrides.range : range;
    if (newStatus) q.set("status", newStatus);
    if (newRange && newRange !== "all") q.set("range", newRange);
    const qs = q.toString();
    return `/admin/pedidos${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-ink">
        Pedidos
        {isDispatchToday && (
          <span className="text-rose"> — por despachar hoy</span>
        )}
      </h1>

      <div>
        <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">
          Período
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={buildHref({ range: r })}
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
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">
          Estado
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href={buildHref({ status: undefined })}
            className={`px-3 py-1 rounded-full border ${
              !status ? "bg-rose text-white border-rose" : "border-ink/20 text-ink/60"
            }`}
          >
            Todos
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={buildHref({ status: s })}
              className={`px-3 py-1 rounded-full border ${
                status === s ? "bg-rose text-white border-rose" : "border-ink/20 text-ink/60"
              }`}
            >
              {STATUS_LABEL[s]}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white border border-ink/10 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-ink/10">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-rose hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3 text-ink/60">
                  {order.createdAt.toLocaleDateString("es-CO")}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCop(order.totalCop)}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink/50">
                  No hay pedidos con este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
