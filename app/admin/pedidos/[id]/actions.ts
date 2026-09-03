"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { applyOrderStatusTransition } from "@/lib/orders";
import type { OrderStatus } from "@/app/generated/prisma/client";

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
