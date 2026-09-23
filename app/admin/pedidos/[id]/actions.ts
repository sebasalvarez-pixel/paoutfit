"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { applyOrderStatusTransition } from "@/lib/orders";
import { sendEmail } from "@/lib/resend";
import { ShippingQuoteReady } from "@/emails/InternationalEmails";
import type { OrderStatus } from "@/app/generated/prisma/client";

/**
 * Registra el costo de envío internacional cotizado con DHL, recalcula el
 * total del pedido y le manda al cliente el link de pago por correo. Se
 * puede volver a usar mientras el pedido siga pendiente (corregir la
 * cotización o reenviar el correo).
 */
export async function setInternationalShipping(orderId: string, formData: FormData) {
  const shippingCop = parseInt(String(formData.get("shippingCop") ?? ""), 10);
  if (!Number.isFinite(shippingCop) || shippingCop <= 0) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || !order.isInternational || order.status !== "pending") return;

  const totalCop = order.subtotalCop - order.discountCop + shippingCop;
  await prisma.order.update({
    where: { id: order.id },
    data: { shippingCop, totalCop, shippingQuotePending: false },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const locale = order.customerLocale === "en" ? "en" : "es";

  await sendEmail({
    to: order.customerEmail,
    subject:
      locale === "en"
        ? `Your shipping quote for order ${order.orderNumber} — PAOUTFIT`
        : `Tu cotización de envío del pedido ${order.orderNumber} — PAOUTFIT`,
    react: ShippingQuoteReady({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      items: order.items.map((i) => ({
        title: i.productTitle,
        color: i.colorName,
        quantity: i.quantity,
        unitPriceCop: i.unitPriceCop,
      })),
      subtotalCop: order.subtotalCop,
      discountCop: order.discountCop,
      shippingCop,
      totalCop,
      payUrl: `${appUrl}/pagar/${order.orderNumber}?lang=${locale}`,
      locale,
    }),
  });

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
}

export async function changeOrderStatus(orderId: string, formData: FormData) {
  const status = String(formData.get("status")) as OrderStatus;
  await applyOrderStatusTransition({
    orderId,
    status,
    source: "admin_manual",
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

/**
 * Guarda transportadora + número de guía y, en el mismo paso, marca el
 * pedido como "fulfilled" (enviado) — así el cliente puede verlo de
 * inmediato en /rastrear-pedido.
 */
export async function markAsShipped(orderId: string, formData: FormData) {
  const carrier = String(formData.get("carrier") ?? "ENVIA").trim() || "ENVIA";
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();

  await prisma.order.update({
    where: { id: orderId },
    data: {
      carrier,
      trackingNumber: trackingNumber || null,
      fulfilledAt: new Date(),
    },
  });

  await applyOrderStatusTransition({
    orderId,
    status: "fulfilled",
    source: "admin_manual",
  });

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}
