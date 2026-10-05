import { prisma } from "@/lib/prisma";
import { sendEmail, ownerRecipients } from "@/lib/resend";
import { fetchWompiTransaction } from "@/lib/wompi";
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

  // Las fuentes automáticas (Wompi, Addi, verificación al volver del pago)
  // nunca pasan un pedido ya pagado/enviado/reembolsado a otro estado: un aviso
  // tardío o repetido no debe deshacer un pago ni descontar dos veces el
  // inventario. Solo la tienda desde el panel puede cambiarlo a mano.
  const automated = params.source !== "admin_manual" && params.source !== "dev_simulation";
  const settled: OrderStatus[] = ["paid", "fulfilled", "refunded"];
  const wasSettled = settled.includes(order.status);
  let changed = false;

  await prisma.$transaction(async (tx) => {
    // El cambio se hace con una condición en la propia consulta: si dos
    // avisos llegan a la vez, solo uno logra cambiar el estado.
    const updated = await tx.order.updateMany({
      where: {
        id: order.id,
        status: automated
          ? { notIn: [params.status, ...settled] }
          : { not: params.status },
      },
      data: {
        status: params.status,
        ...(params.providerEventId
          ? { paymentReference: params.providerEventId }
          : {}),
      },
    });
    if (updated.count === 0) return;
    changed = true;

    await tx.orderStatusEvent.create({
      data: {
        orderId: order.id,
        status: params.status,
        source: params.source,
        providerEventId: params.providerEventId,
        rawPayload: params.rawPayload as never,
      },
    });

    if (params.status === "paid" && !wasSettled) {
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

  if (!changed) return;

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
        paymentFeeCop: order.paymentFeeCop,
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
          paymentFeeCop: order.paymentFeeCop,
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

const WOMPI_STATUS_TO_ORDER: Record<string, OrderStatus> = {
  APPROVED: "paid",
  DECLINED: "failed",
  ERROR: "failed",
  VOIDED: "cancelled",
};

/**
 * Red de seguridad para cuando el aviso automático (webhook) de Wompi no
 * llega: al volver el cliente a la tienda con ?id=<transacción>, se le
 * consulta a Wompi directamente qué pasó con ESE pago y, solo si la
 * referencia y el monto coinciden con el pedido, se aplica el resultado.
 * No se confía en nada que venga del navegador: cuenta únicamente la
 * respuesta de Wompi. Es seguro llamarla varias veces (es idempotente).
 */
export async function syncWompiPaymentOnReturn(
  order: { id: string; orderNumber: string; totalCop: number; status: OrderStatus },
  transactionId: string,
) {
  if (order.status !== "pending") return;

  const tx = await fetchWompiTransaction(transactionId);
  if (!tx) return;

  const matches =
    tx.reference === order.orderNumber &&
    tx.amountInCents === order.totalCop * 100 &&
    tx.currency === "COP";
  if (!matches) {
    console.warn(
      `[wompi return] La transacción ${tx.id} no coincide con el pedido ${order.orderNumber} (referencia/monto): se ignora.`,
    );
    return;
  }

  const status = WOMPI_STATUS_TO_ORDER[tx.status];
  if (!status) return; // PENDING u otro estado aún sin resolver

  await applyOrderStatusTransition({
    orderId: order.id,
    status,
    source: "wompi_return_check",
    providerEventId: tx.id,
    rawPayload: tx,
  });
}
