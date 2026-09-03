import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWompiEventSignature } from "@/lib/wompi";
import { applyOrderStatusTransition } from "@/lib/orders";
import type { OrderStatus } from "@/app/generated/prisma/client";

const STATUS_MAP: Record<string, OrderStatus> = {
  APPROVED: "paid",
  DECLINED: "failed",
  VOIDED: "cancelled",
  ERROR: "failed",
};

export async function POST(request: NextRequest) {
  const payload = await request.json();

  const { event, data, timestamp, signature, environment } = payload as {
    event: string;
    data: { transaction: Record<string, unknown> };
    timestamp: number;
    signature: { checksum: string; properties: string[] };
    environment?: string;
  };

  // 1. Verificar la firma ANTES de tocar la base de datos.
  let signatureValid = false;
  try {
    signatureValid = verifyWompiEventSignature({
      properties: signature.properties,
      data,
      timestamp,
      checksum: signature.checksum,
    });
  } catch {
    signatureValid = false;
  }

  if (!signatureValid) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  if (event !== "transaction.updated") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const transaction = data.transaction;
  const eventId = String(transaction.id);
  const reference = String(transaction.reference);
  const wompiStatus = String(transaction.status);

  // 2. Idempotencia: si ya procesamos este evento, no lo repetimos.
  const existing = await prisma.paymentWebhookEvent.findUnique({
    where: { provider_eventId: { provider: "wompi", eventId } },
  });
  if (existing) {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  await prisma.paymentWebhookEvent.create({
    data: {
      provider: "wompi",
      eventId,
      payload: payload as never,
    },
  });

  const order = await prisma.order.findUnique({
    where: { orderNumber: reference },
  });
  if (!order) {
    console.warn(
      `[wompi webhook] orden con referencia "${reference}" no encontrada (env: ${environment})`,
    );
    return NextResponse.json({ ok: true, orderNotFound: true });
  }

  const mappedStatus = STATUS_MAP[wompiStatus] ?? "failed";

  await applyOrderStatusTransition({
    orderId: order.id,
    status: mappedStatus,
    source: "wompi_webhook",
    providerEventId: eventId,
    rawPayload: payload,
  });

  return NextResponse.json({ ok: true });
}
