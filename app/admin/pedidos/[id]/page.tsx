import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCop } from "@/lib/format";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { changeOrderStatus, markAsShipped } from "./actions";

const STATUSES = [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "fulfilled",
  "refunded",
] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
      discountCode: true,
    },
  });
  if (!order) notFound();

  const address = order.shippingAddress as {
    line1: string;
    line2?: string;
    city: string;
    department: string;
  };

  const boundChangeStatus = changeOrderStatus.bind(null, order.id);
  const boundMarkAsShipped = markAsShipped.bind(null, order.id);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-ink">
            {order.orderNumber}
          </h1>
          <p className="text-ink/50 text-sm">
            {order.createdAt.toLocaleString("es-CO")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white border border-ink/10 rounded p-5">
          <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-3">
            Cliente
          </h2>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-sm text-ink/70">{order.customerEmail}</p>
          <p className="text-sm text-ink/70">{order.customerPhone}</p>
        </div>
        <div className="bg-white border border-ink/10 rounded p-5">
          <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-3">
            Envío
          </h2>
          <p className="text-sm">{address.line1}</p>
          {address.line2 && <p className="text-sm">{address.line2}</p>}
          <p className="text-sm text-ink/70">
            {address.city}, {address.department}
          </p>
        </div>
      </div>

      <div className="bg-white border border-ink/10 rounded p-5">
        <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-3">
          Productos
        </h2>
        <ul className="divide-y divide-ink/10">
          {order.items.map((item) => (
            <li key={item.id} className="py-2 flex justify-between text-sm">
              <span>
                {item.productTitle} ({item.colorName}) × {item.quantity}
              </span>
              <span>{formatCop(item.unitPriceCop * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-ink/10 mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-ink/60">
            <span>Subtotal</span>
            <span>{formatCop(order.subtotalCop)}</span>
          </div>
          {order.discountCop > 0 && (
            <div className="flex justify-between text-ink/60">
              <span>Descuento {order.discountCode?.code}</span>
              <span>-{formatCop(order.discountCop)}</span>
            </div>
          )}
          <div className="flex justify-between text-ink/60">
            <span>Envío</span>
            <span>{order.shippingCop === 0 ? "Gratis" : formatCop(order.shippingCop)}</span>
          </div>
          <div className="flex justify-between font-semibold text-ink pt-1">
            <span>Total</span>
            <span>{formatCop(order.totalCop)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-ink/10 rounded p-5">
        <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-3">
          Despacho
        </h2>
        {order.fulfilledAt && (
          <p className="text-sm text-emerald-700 mb-3">
            ✓ Enviado el {order.fulfilledAt.toLocaleString("es-CO")}
          </p>
        )}
        <form
          action={boundMarkAsShipped}
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="text-xs text-ink/60">Transportadora</label>
            <input
              name="carrier"
              defaultValue={order.carrier ?? "ENVIA"}
              className="border border-ink/20 px-3 py-2 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-ink/60"># de guía</label>
            <input
              name="trackingNumber"
              defaultValue={order.trackingNumber ?? ""}
              placeholder="Ej. 123456789"
              className="border border-ink/20 px-3 py-2 text-sm mt-1"
            />
          </div>
          <button
            type="submit"
            className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors"
          >
            Guardar y marcar como enviado
          </button>
        </form>
        <p className="text-xs text-ink/40 mt-2">
          Al guardar, el pedido pasa a &quot;fulfilled&quot; y el cliente
          verá la guía en la página de rastreo.
        </p>
      </div>

      <div className="bg-white border border-ink/10 rounded p-5">
        <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-3">
          Cambiar estado
        </h2>
        <form action={boundChangeStatus} className="flex items-center gap-3">
          <select
            name="status"
            defaultValue={order.status}
            className="border border-ink/20 px-3 py-2 text-sm capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors"
          >
            Actualizar
          </button>
        </form>
        <p className="text-xs text-ink/40 mt-2">
          Si cambias a &quot;Pagado&quot;, se descuenta inventario y se envía
          el correo de confirmación (si no se había enviado antes).
        </p>
      </div>

      <div>
        <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-3">
          Historial
        </h2>
        <ul className="space-y-2">
          {order.statusHistory.map((event) => (
            <li key={event.id} className="text-xs text-ink/60 flex gap-2">
              <span>{event.createdAt.toLocaleString("es-CO")}</span>
              <span className="capitalize">{event.status}</span>
              <span className="text-ink/40">({event.source})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
