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
import { createAddiApplication, getAddiConfig, isAddiConfigured } from "@/lib/addi";
import { sendEmail } from "@/lib/resend";
import {
  InternationalOrderReceived,
  InternationalQuoteRequest,
} from "@/emails/InternationalEmails";

const FLAT_SHIPPING_COP = 12000;
const FREE_SHIPPING_THRESHOLD_COP = 200000;

const checkoutSchema = z
  .object({
    customerName: z.string().min(2, "Ingresa tu nombre completo."),
    customerEmail: z.string().email("Ingresa un correo válido."),
    customerPhone: z.string().min(7, "Ingresa un teléfono válido."),
    customerIdNumber: z.string().optional(),
    shippingMode: z.enum(["national", "international"]).default("national"),
    locale: z.enum(["es", "en"]).default("es"),
    addressLine1: z.string().min(4, "Ingresa tu dirección."),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "Ingresa tu ciudad."),
    department: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    discountCode: z.string().optional(),
    paymentMethod: z.enum(["wompi", "addi"]).default("wompi"),
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
  })
  .refine(
    (data) =>
      data.shippingMode !== "national" || (data.department?.trim().length ?? 0) >= 2,
    { message: "Ingresa tu departamento.", path: ["department"] },
  )
  .refine(
    (data) =>
      data.shippingMode !== "international" || (data.country?.trim().length ?? 0) >= 2,
    { message: "Ingresa tu país.", path: ["country"] },
  )
  .refine(
    (data) => data.paymentMethod !== "addi" || (data.customerIdNumber?.length ?? 0) >= 6,
    {
      message: "Para pagar con Addi necesitamos tu número de cédula.",
      path: ["customerIdNumber"],
    },
  )
  .refine((data) => !(data.shippingMode === "international" && data.paymentMethod === "addi"), {
    message: "Addi solo está disponible para envíos dentro de Colombia.",
    path: ["paymentMethod"],
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutResult =
  | {
      ok: true;
      orderNumber: string;
      totalCop: number;
      wompi: ReturnType<typeof buildWompiCheckoutFields> | null;
      wompiCheckoutUrl: string;
      addiRedirectUrl: string | null;
      devPaymentAvailable: boolean;
      // true para envíos internacionales: el pedido queda registrado sin
      // cobrar, hasta que se cotice el envío con DHL.
      quoteRequested: boolean;
      orderId: string;
    }
  | { ok: false; error: string };

export async function getAddiAvailability(totalCop: number) {
  if (!isAddiConfigured()) return { available: false, inRange: false };
  const config = await getAddiConfig(totalCop);
  if (!config) return { available: false, inRange: false };
  const inRange = totalCop >= config.minAmount && totalCop <= config.maxAmount;
  return {
    // isActivePayNow es otro producto de Addi (pago inmediato); nosotros usamos
    // solicitudes online, que solo dependen de que el aliado esté activo.
    available: config.isActiveAlly,
    inRange,
    minAmount: config.minAmount,
    maxAmount: config.maxAmount,
  };
}

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

  const isInternational = data.shippingMode === "international";

  // Envío internacional: el costo real lo da DHL según el destino, así que
  // el pedido se registra con envío en 0 y "por cotizar"; la dueña lo
  // cotiza en el panel y ahí se le manda el link de pago al cliente.
  const shippingCop = isInternational
    ? 0
    : subtotalCop - discountCop >= FREE_SHIPPING_THRESHOLD_COP
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
      customerIdNumber: data.customerIdNumber || null,
      customerLocale: data.locale,
      isInternational,
      shippingQuotePending: isInternational,
      carrier: isInternational ? "DHL" : undefined,
      shippingAddress: {
        line1: data.addressLine1,
        line2: data.addressLine2 ?? "",
        city: data.city,
        department: data.department ?? "",
        country: isInternational ? data.country!.trim() : "Colombia",
        postalCode: data.postalCode ?? "",
      },
      subtotalCop,
      discountCop,
      shippingCop,
      totalCop,
      discountCodeId,
      paymentProvider: data.paymentMethod,
      dataPolicyAcceptedAt: new Date(),
      ...attribution,
      items: { create: orderItemsData },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUrl = `${appUrl}/pedido-confirmado/${order.orderNumber}`;

  if (isInternational) {
    const itemsForEmail = orderItemsData.map((item) => ({
      title: item.productTitle,
      color: item.colorName,
      quantity: item.quantity,
      unitPriceCop: item.unitPriceCop,
    }));
    const addressText = [
      data.addressLine1,
      data.addressLine2,
      data.city,
      data.department,
      data.postalCode,
      data.country,
    ]
      .filter(Boolean)
      .join(", ");

    await sendEmail({
      to: data.customerEmail,
      subject:
        data.locale === "en"
          ? `We received your order ${order.orderNumber} — PAOUTFIT`
          : `Recibimos tu pedido ${order.orderNumber} — PAOUTFIT`,
      react: InternationalOrderReceived({
        orderNumber: order.orderNumber,
        customerName: data.customerName,
        items: itemsForEmail,
        subtotalCop: subtotalCop - discountCop,
        locale: data.locale,
      }),
    });

    if (process.env.OWNER_NOTIFICATION_EMAIL) {
      await sendEmail({
        to: process.env.OWNER_NOTIFICATION_EMAIL,
        subject: `🌎 Pedido internacional por cotizar: ${order.orderNumber}`,
        react: InternationalQuoteRequest({
          orderNumber: order.orderNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          addressText,
          items: itemsForEmail,
          subtotalCop: subtotalCop - discountCop,
          adminUrl: `${appUrl}/admin/pedidos/${order.id}`,
        }),
      });
    }

    return {
      ok: true,
      orderNumber: order.orderNumber,
      totalCop,
      orderId: order.id,
      wompiCheckoutUrl: WOMPI_CHECKOUT_URL,
      wompi: null,
      addiRedirectUrl: null,
      devPaymentAvailable: false,
      quoteRequested: true,
    };
  }

  if (data.paymentMethod === "addi") {
    const addiResult = await createAddiApplication({
      orderNumber: order.orderNumber,
      totalCop,
      shippingCop,
      items: orderItemsData.map((item) => ({
        sku: item.sku,
        name: item.productTitle,
        quantity: item.quantity,
        unitPriceCop: item.unitPriceCop,
      })),
      customer: {
        idNumber: data.customerIdNumber!,
        fullName: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
      },
      address: { line1: data.addressLine1, city: data.city },
      callbackUrl: `${appUrl}/api/webhooks/addi`,
      redirectionUrl: `${appUrl}/addi-retorno/${order.orderNumber}`,
    });

    if (!addiResult.ok) {
      return { ok: false, error: addiResult.error };
    }

    return {
      ok: true,
      orderNumber: order.orderNumber,
      totalCop,
      orderId: order.id,
      wompiCheckoutUrl: WOMPI_CHECKOUT_URL,
      wompi: null,
      addiRedirectUrl: addiResult.redirectUrl,
      devPaymentAvailable: false,
      quoteRequested: false,
    };
  }

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
    addiRedirectUrl: null,
    devPaymentAvailable: !wompiReady && process.env.NODE_ENV !== "production",
    quoteRequested: false,
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
