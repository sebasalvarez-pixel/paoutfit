import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { OrderConfirmation } from "@/emails/OrderConfirmation";
import type { OrderStatus } from "@/app/generated/prisma/client";

export function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `PAO-${stamp}${random}`;
}

/**
 * Aplica una transición de estado a un pedido de forma centralizada, para
 * que tanto el webhook de Wompi como el de Addi (y más adelante el panel
 * admin) compartan la misma lógica: registrar el historial, descontar
 * inventario al pasar a "paid", y disparar el correo de confirmación.
 */
export async function applyOrderStatusTransition(params: {
  orderId: string;
  status: OrderStatus;
  source: string;
  providerEventId?: string;
  rawPayload?: unknown;
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { items: true, discountCode: true },
  });
  if (!order) throw new Error(`Orden ${params.orderId} no encontrada`);

  const alreadyInStatus = order.status === params.status;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: params.status,
        ...(params.providerEventId
          ? { paymentReference: params.providerEventId }
          : {}),
      },
    });
    await tx.orderStatusEvent.create({
      data: {
        orderId: order.id,
        status: params.status,
        source: params.source,
        providerEventId: params.providerEventId,
        rawPayload: params.rawPayload as never,
      },
    });

    if (params.status === "paid" && order.status !== "paid") {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { inventoryQty: { decrement: item.quantity } },
        });
      }
      if (order.discountCodeId) {
        await tx.discountCode.update({
          where: { id: order.discountCodeId },
          data: { usesCount: { increment: 1 } },
        });
      }
    }
  });

  if (params.status === "paid" && !alreadyInStatus) {
    await sendEmail({
      to: order.customerEmail,
      subject: `Confirmamos tu pedido ${order.orderNumber} — PAOUTFIT`,
      react: OrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        items: order.items.map((i) => ({
          title: i.productTitle,
          color: i.colorName,
          quantity: i.quantity,
          unitPriceCop: i.unitPriceCop,
        })),
        totalCop: order.totalCop,
      }),
    });
  }
}
