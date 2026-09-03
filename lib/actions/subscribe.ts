"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { WelcomeDiscount } from "@/emails/WelcomeDiscount";

const emailSchema = z.string().email();

export type SubscribeResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function subscribeEmail(email: string): Promise<SubscribeResult> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: "Ingresa un correo válido." };
  }

  const discountCode = await prisma.discountCode.findUnique({
    where: { code: "BIENVENIDA5" },
  });
  if (!discountCode) {
    return { ok: false, error: "No se pudo generar el descuento, intenta más tarde." };
  }

  await prisma.subscriber.upsert({
    where: { email: parsed.data },
    update: {},
    create: {
      email: parsed.data,
      source: "popup",
      discountCodeId: discountCode.id,
    },
  });

  await sendEmail({
    to: parsed.data,
    subject: "Tu 5% de descuento — PAOUTFIT",
    react: WelcomeDiscount({ code: discountCode.code }),
  });

  return { ok: true, code: discountCode.code };
}
