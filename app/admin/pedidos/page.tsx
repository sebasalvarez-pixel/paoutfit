import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCop } from "@/lib/format";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

const STATUSES = [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "fulfilled",
  "refunded",
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await prisma.order.findMany({
    where: status ? { status: status as (typeof STATUSES)[number] } : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-ink">Pedidos</h1>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link
          href="/admin/pedidos"
          className={`px-3 py-1 rounded-full border ${
            !status ? "bg-rose text-white border-rose" : "border-ink/20 text-ink/60"
          }`}
        >
          Todos
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pedidos?status=${s}`}
            className={`px-3 py-1 rounded-full border capitalize ${
              status === s ? "bg-rose text-white border-rose" : "border-ink/20 text-ink/60"
            }`}
          >
            {s}
          </Link>
        ))}
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
