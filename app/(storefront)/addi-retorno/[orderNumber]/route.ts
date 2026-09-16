import { NextRequest, NextResponse } from "next/server";
import { isAddiStatusApproved } from "@/lib/addi";

/**
 * A esta URL regresa el cliente después de terminar (o abandonar) el
 * proceso en el sitio de Addi. El manual de integración no confirma el
 * nombre exacto del parámetro de estado que Addi agrega a esta URL, así
 * que se revisan varios nombres razonables ("status", "state", "result")
 * de forma defensiva: si no aparece ninguno, se asume que sigue en
 * proceso y se manda a la página del pedido (que ya muestra el estado
 * real, actualizado por el webhook).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const { searchParams } = new URL(request.url);
  const status =
    searchParams.get("status") ?? searchParams.get("state") ?? searchParams.get("result");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (status && !isAddiStatusApproved(status)) {
    return NextResponse.redirect(`${appUrl}/carrito`);
  }

  return NextResponse.redirect(`${appUrl}/pedido-confirmado/${orderNumber}`);
}
