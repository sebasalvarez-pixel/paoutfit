import { prisma } from "@/lib/prisma";
import { sendEmail, ownerRecipients } from "@/lib/resend";
import { OrderConfirmation } from "@/emails/OrderConfirmation";
import { OrderShipped } from "@/emails/OrderShipped";
import { NewOrderNotification } from "@/emails/NewOrderNotification";
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

  if (alreadyInStatus) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const locale = order.customerLocale === "en" ? "en" : "es";
  const trackUrl = `${appUrl}/rastrear-pedido`;

  if (params.status === "paid") {
    const itemsForEmail = order.items.map((i) => ({
      title: i.productTitle,
      color: i.colorName,
      quantity: i.quantity,
      unitPriceCop: i.unitPriceCop,
    }));

    // Dirección de envío en líneas legibles, para el cliente y para la tienda.
    const address = order.shippingAddress as {
      line1?: string;
      line2?: string;
      city?: string;
      department?: string;
      country?: string;
      postalCode?: string;
    };
    const addressLines = [
      order.customerName,
      address.line1,
      address.line2,
      [address.city, address.department].filter(Boolean).join(", "),
      [address.country, address.postalCode].filter(Boolean).join(" · "),
    ].filter((l): l is string => Boolean(l && l.trim()));

    // Confirmación para la clienta que compró (en su idioma).
    await sendEmail({
      to: order.customerEmail,
      subject:
        locale === "en"
          ? `Your order ${order.orderNumber} is confirmed — PAOUTFIT`
          : `Confirmamos tu pedido ${order.orderNumber} — PAOUTFIT`,
      react: OrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        items: itemsForEmail,
        subtotalCop: order.subtotalCop,
        discountCop: order.discountCop,
        shippingCop: order.shippingCop,
        totalCop: order.totalCop,
        addressLines,
        trackUrl,
        locale,
      }),
    });

    // Aviso de nueva venta para la tienda (uno o varios correos).
    const owners = ownerRecipients();
    if (owners.length > 0) {
      await sendEmail({
        to: owners,
        subject: `💰 Nueva venta ${order.orderNumber} — $${order.totalCop.toLocaleString("es-CO")}`,
        react: NewOrderNotification({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          items: itemsForEmail,
          subtotalCop: order.subtotalCop,
          discountCop: order.discountCop,
          shippingCop: order.shippingCop,
          totalCop: order.totalCop,
          addressLines,
          paymentMethod: order.paymentProvider === "addi" ? "Addi" : "Wompi (tarjeta / PSE)",
          isInternational: order.isInternational,
          adminUrl: `${appUrl}/admin/pedidos/${order.id}`,
        }),
      });
    }
  }

  // Cuando la tienda registra el envío, la clienta recibe su guía por correo.
  if (params.status === "fulfilled") {
    await sendEmail({
      to: order.customerEmail,
      subject:
        locale === "en"
          ? `Your order ${order.orderNumber} is on its way — PAOUTFIT`
          : `Tu pedido ${order.orderNumber} va en camino — PAOUTFIT`,
      react: OrderShipped({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        carrier: order.carrier,
        trackingNumber: order.trackingNumber,
        trackUrl,
        locale,
      }),
    });
  }
}
