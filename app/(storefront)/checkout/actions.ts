"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readAttribution } from "@/lib/attribution";
import { applyOrderStatusTransition, generateOrderNumber } from "@/lib/orders";
import {
  buildWompiCheckoutFields,
  isWompiConfigured,
  WOMPI_CHECKOUT_URL,
} from "@/lib/wompi";

const FLAT_SHIPPING_COP = 12000;
const FREE_SHIPPING_THRESHOLD_COP = 200000;

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Ingresa tu nombre completo."),
  customerEmail: z.string().email("Ingresa un correo válido."),
  customerPhone: z.string().min(7, "Ingresa un teléfono válido."),
  addressLine1: z.string().min(4, "Ingresa tu dirección."),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "Ingresa tu ciudad."),
  department: z.string().min(2, "Ingresa tu departamento."),
  discountCode: z.string().optional(),
  acceptedDataPolicy: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar la política de tratamiento de datos para continuar.",
  }),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, "Tu carrito está vacío."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutResult =
  | {
      ok: true;
      orderNumber: string;
      totalCop: number;
      wompi: ReturnType<typeof buildWompiCheckoutFields> | null;
      wompiCheckoutUrl: string;
      devPaymentAvailable: boolean;
      orderId: string;
    }
  | { ok: false; error: string };

export async function createOrder(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const variantIds = data.items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    return { ok: false, error: "Uno de los productos ya no está disponible." };
  }

  let subtotalCop = 0;
  const orderItemsData: {
    variantId: string;
    productTitle: string;
    colorName: string;
    sku: string;
    unitPriceCop: number;
    quantity: number;
  }[] = [];

  for (const line of data.items) {
    const variant = variants.find((v) => v.id === line.variantId)!;
    if (variant.inventoryQty < line.quantity) {
      return {
        ok: false,
        error: `No hay suficiente inventario de ${variant.product.title} (${variant.colorName}).`,
      };
    }
    subtotalCop += variant.priceCop * line.quantity;
    orderItemsData.push({
      variantId: variant.id,
      productTitle: variant.product.title,
      colorName: variant.colorName,
      sku: variant.sku,
      unitPriceCop: variant.priceCop,
      quantity: line.quantity,
    });
  }

  let discountCop = 0;
  let discountCodeId: string | null = null;
  if (data.discountCode) {
    const code = await prisma.discountCode.findUnique({
      where: { code: data.discountCode.toUpperCase() },
    });
    const isValid =
      code &&
      code.isActive &&
      (!code.expiresAt || code.expiresAt > new Date()) &&
      (!code.maxUses || code.usesCount < code.maxUses);
    if (!isValid) {
      return { ok: false, error: "Ese código de descuento no es válido." };
    }
    discountCodeId = code.id;
    discountCop =
      code.type === "percentage"
        ? Math.round((subtotalCop * code.value) / 100)
        : code.value;
  }

  const shippingCop =
    subtotalCop - discountCop >= FREE_SHIPPING_THRESHOLD_COP
      ? 0
      : FLAT_SHIPPING_COP;
  const totalCop = subtotalCop - discountCop + shippingCop;

  const attribution = await readAttribution();
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      status: "pending",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: {
        line1: data.addressLine1,
        line2: data.addressLine2 ?? "",
        city: data.city,
        department: data.department,
      },
      subtotalCop,
      discountCop,
      shippingCop,
      totalCop,
      discountCodeId,
      paymentProvider: "wompi",
      dataPolicyAcceptedAt: new Date(),
      ...attribution,
      items: { create: orderItemsData },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUrl = `${appUrl}/pedido-confirmado/${order.orderNumber}`;

  const wompiReady = isWompiConfigured();

  return {
    ok: true,
    orderNumber: order.orderNumber,
    totalCop,
    orderId: order.id,
    wompiCheckoutUrl: WOMPI_CHECKOUT_URL,
    wompi: wompiReady
      ? buildWompiCheckoutFields({
          reference: order.orderNumber,
          amountInCents: totalCop * 100,
          redirectUrl,
          customerEmail: data.customerEmail,
        })
      : null,
    devPaymentAvailable: !wompiReady && process.env.NODE_ENV !== "production",
  };
}

/**
 * SOLO para desarrollo local: simula que Wompi aprobó el pago, sin tener
 * llaves reales todavía, para poder probar el flujo completo (inventario,
 * correo de confirmación) de punta a punta. Nunca se ejecuta en producción
 * ni si Wompi ya está configurado de verdad.
 */
export async function devSimulatePayment(orderId: string) {
  if (process.env.NODE_ENV === "production" || isWompiConfigured()) {
    throw new Error("La simulación de pago solo está disponible en desarrollo.");
  }
  await applyOrderStatusTransition({
    orderId,
    status: "paid",
    source: "dev_simulation",
  });
}
