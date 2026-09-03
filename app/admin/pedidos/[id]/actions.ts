"use server";

import { revalidatePath } from "next/cache";
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
