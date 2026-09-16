import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAddiWebhookAuth, isAddiStatusApproved } from "@/lib/addi";
import { applyOrderStatusTransition } from "@/lib/orders";

type AddiCallbackPayload = {
  orderId: string;
  applicationId: string;
  approvedAmount: string;
  currency: string;
  status: string;
  statusTimestamp: string;
};

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as AddiCallbackPayload;

  // 1. Verificar Basic Auth ANTES de tocar la base de datos.
  const authorized = verifyAddiWebhookAuth(request.headers.get("authorization"));
  if (!authorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { orderId: orderNumber, applicationId, status } = payload;

  // 2. Idempotencia: si ya procesamos esta respuesta, no la repetimos.
  // Addi puede reintentar cada 30 minutos hasta por 24 horas.
  const eventId = `${applicationId}:${status}`;
  const existing = await prisma.paymentWebhookEvent.findUnique({
    where: { provider_eventId: { provider: "addi", eventId } },
  });
  if (existing) {
    return NextResponse.json(payload);
  }

  await prisma.paymentWebhookEvent.create({
    data: { provider: "addi", eventId, payload: payload as never },
  });

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) {
    console.warn(`[addi webhook] orden "${orderNumber}" no encontrada`);
    // Igual respondemos 200 con el mismo body: Addi solo reintenta en
    // fallos de comunicación, no cuando ya recibimos la notificación.
    return NextResponse.json(payload);
  }

  await applyOrderStatusTransition({
    orderId: order.id,
    status: isAddiStatusApproved(status) ? "paid" : "failed",
    source: "addi_webhook",
    providerEventId: applicationId,
    rawPayload: payload,
  });

  // Addi exige responder 200 con exactamente el mismo cuerpo recibido.
  return NextResponse.json(payload);
}
