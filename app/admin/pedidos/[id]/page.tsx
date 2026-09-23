import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCop } from "@/lib/format";
import { OrderStatusBadge, STATUS_LABEL } from "@/components/admin/OrderStatusBadge";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { AdminForm } from "@/components/admin/AdminForm";
import { changeOrderStatus, markAsShipped, setInternationalShipping } from "./actions";

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
    country?: string;
    postalCode?: string;
  };

  const boundChangeStatus = changeOrderStatus.bind(null, order.id);
  const boundMarkAsShipped = markAsShipped.bind(null, order.id);
  const boundSetInternationalShipping = setInternationalShipping.bind(null, order.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="max-w-3xl space-y-8">
      <UnsavedChangesGuard />
      <div className="flex items-center justify-between">
        <div>
          <a
            href="/admin/pedidos"
            className="text-xs uppercase tracking-wide text-ink/50 hover:text-rose"
          >
            ← Volver a pedidos
          </a>
          <h1 className="font-heading text-3xl text-ink mt-2">
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
          {order.isInternational && (
            <p className="text-xs uppercase tracking-wide text-rose mb-2">
              🌎 Internacional · idioma: {order.customerLocale === "en" ? "inglés" : "español"}
            </p>
          )}
          <p className="text-sm">{address.line1}</p>
          {address.line2 && <p className="text-sm">{address.line2}</p>}
          <p className="text-sm text-ink/70">
            {[address.city, address.department, address.postalCode]
              .filter(Boolean)
              .join(", ")}
          </p>
          {order.isInternational && address.country && (
            <p className="text-sm font-medium">{address.country}</p>
          )}
        </div>
      </div>

      {order.isInternational && (
        <div className="bg-white border border-ink/10 rounded p-5">
          <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-3">
            Cotización de envío internacional (DHL)
          </h2>
          {order.shippingQuotePending ? (
            <p className="text-sm text-amber-700 mb-3">
              Este pedido está esperando tu cotización. Cotiza el envío con DHL
              a la dirección de arriba y escribe el valor en pesos (COP).
            </p>
          ) : (
            <p className="text-sm text-emerald-700 mb-3">
              Envío cotizado: {formatCop(order.shippingCop)}.
              {order.status === "pending"
                ? " Si te equivocaste, puedes corregirlo y reenviar el link."
                : ""}
            </p>
          )}
          {order.status === "pending" ? (
            <AdminForm
              action={boundSetInternationalShipping}
              successMessage="Envío guardado y link de pago enviado al cliente"
              className="flex flex-wrap items-end gap-3"
            >
              <div>
                <label className="text-xs text-ink/60">Costo del envío (COP)</label>
                <input
                  name="shippingCop"
                  type="number"
                  min={1}
                  required
                  defaultValue={order.shippingQuotePending ? undefined : order.shippingCop}
                  placeholder="Ej. 180000"
                  className="border border-ink/20 px-3 py-2 text-sm mt-1"
                />
              </div>
              <button
                type="submit"
                className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors"
              >
                {order.shippingQuotePending
                  ? "Guardar y enviar link de pago"
                  : "Guardar y reenviar link de pago"}
              </button>
            </AdminForm>
          ) : null}
          {!order.shippingQuotePending && order.status === "pending" && (
            <p className="text-xs text-ink/50 mt-3 break-all">
              Link de pago del cliente: {appUrl}/pagar/{order.orderNumber}
            </p>
          )}
        </div>
      )}

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
            <span>
              {order.shippingQuotePending
                ? "Por cotizar"
                : order.shippingCop === 0
                  ? "Gratis"
                  : formatCop(order.shippingCop)}
            </span>
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
        <AdminForm
          action={boundMarkAsShipped}
          successMessage="Pedido marcado como enviado"
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="text-xs text-ink/60">Transportadora</label>
            <input
              name="carrier"
              defaultValue={order.carrier ?? (order.isInternational ? "DHL" : "Interrapidísimo")}
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
        </AdminForm>
        <p className="text-xs text-ink/40 mt-2">
          Al guardar, el pedido pasa a &quot;Enviado&quot; y el cliente
          verá la guía en la página de rastreo.
        </p>
      </div>

      <div className="bg-white border border-ink/10 rounded p-5">
        <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-3">
          Cambiar estado
        </h2>
        <AdminForm
          action={boundChangeStatus}
          successMessage="Estado actualizado"
          className="flex items-center gap-3"
        >
          <select
            name="status"
            defaultValue={order.status}
            className="border border-ink/20 px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors"
          >
            Actualizar
          </button>
        </AdminForm>
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
              <span>{STATUS_LABEL[event.status] ?? event.status}</span>
              <span className="text-ink/40">({event.source})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
