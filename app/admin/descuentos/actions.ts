"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createDiscountCode(formData: FormData) {
  const code = String(formData.get("code")).trim().toUpperCase();
  const type = String(formData.get("type")) as "percentage" | "fixed";
  const value = parseInt(String(formData.get("value")), 10);
  const maxUsesRaw = String(formData.get("maxUses") ?? "");

  if (!code || Number.isNaN(value)) return;

  await prisma.discountCode.create({
    data: {
      code,
      type,
      value,
      maxUses: maxUsesRaw ? parseInt(maxUsesRaw, 10) : null,
      isActive: true,
    },
  });
  revalidatePath("/admin/descuentos");
}

export async function toggleDiscountCode(id: string, isActive: boolean) {
  await prisma.discountCode.update({
    where: { id },
    data: { isActive: !isActive },
  });
  revalidatePath("/admin/descuentos");
}
