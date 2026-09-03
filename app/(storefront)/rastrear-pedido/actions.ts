"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const lookupSchema = z.object({
  orderNumber: z.string().min(3),
  email: z.string().email(),
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente de pago",
  paid: "Pagado — en preparación",
  failed: "El pago falló",
  cancelled: "Cancelado",
  fulfilled: "Enviado",
  refunded: "Reembolsado",
};

export type LookupResult =
  | {
      ok: true;
      orderNumber: string;
      statusLabel: string;
      totalCop: number;
      createdAt: string;
      items: { title: string; color: string; quantity: number }[];
      carrier: string | null;
      trackingNumber: string | null;
      fulfilledAt: string | null;
    }
  | { ok: false; error: string };

export async function lookupOrder(input: {
  orderNumber: string;
  email: string;
}): Promise<LookupResult> {
  const parsed = lookupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ingresa un número de pedido y correo válidos." };
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: { equals: parsed.data.orderNumber.trim(), mode: "insensitive" },
      customerEmail: { equals: parsed.data.email.trim(), mode: "insensitive" },
    },
    include: { items: true },
  });

  // Mensaje genérico a propósito: no revelamos si el correo existe o si
  // solo el número de pedido está mal, para no facilitar adivinar pedidos.
  if (!order) {
    return {
      ok: false,
      error: "No encontramos un pedido con esos datos. Revisa el número de pedido y el correo.",
    };
  }

  return {
    ok: true,
    orderNumber: order.orderNumber,
    statusLabel: STATUS_LABEL[order.status] ?? order.status,
    totalCop: order.totalCop,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      title: i.productTitle,
      color: i.colorName,
      quantity: i.quantity,
    })),
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    fulfilledAt: order.fulfilledAt ? order.fulfilledAt.toISOString() : null,
  };
}
