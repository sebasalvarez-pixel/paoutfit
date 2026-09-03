import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCop } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente de pago",
  paid: "Pagado",
  failed: "El pago falló",
  cancelled: "Cancelado",
  fulfilled: "Enviado",
  refunded: "Reembolsado",
};

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-heading text-3xl text-ink mb-2">
        {order.status === "paid" ? "¡Gracias por tu compra!" : "Pedido recibido"}
      </h1>
      <p className="text-ink/60 mb-6">
        Pedido <strong>{order.orderNumber}</strong> —{" "}
        {STATUS_LABEL[order.status] ?? order.status}
      </p>

      <ul className="text-left divide-y divide-ink/10 mb-6">
        {order.items.map((item) => (
          <li key={item.id} className="py-3 flex justify-between text-sm">
            <span>
              {item.productTitle} ({item.colorName}) × {item.quantity}
            </span>
            <span>{formatCop(item.unitPriceCop * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between font-semibold mb-8">
        <span>Total</span>
        <span className="text-rose">{formatCop(order.totalCop)}</span>
      </div>

      <Link
        href="/"
        className="inline-block bg-rose text-white px-8 py-3 uppercase text-sm tracking-wide hover:bg-plum transition-colors"
      >
        Seguir comprando
      </Link>
    </div>
  );
}
