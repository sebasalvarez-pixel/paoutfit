import crypto from "node:crypto";

export const WOMPI_CHECKOUT_URL = "https://checkout.wompi.co/p/";

export function isWompiConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY &&
      process.env.WOMPI_INTEGRITY_SECRET,
  );
}

/**
 * Firma de integridad que exige Wompi para el Web Checkout:
 * SHA-256("<referencia><monto_en_centavos><moneda><secreto_de_integridad>")
 * https://docs.wompi.co/
 */
export function generateIntegritySignature(params: {
  reference: string;
  amountInCents: number;
  currency: string;
}) {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) {
    throw new Error("WOMPI_INTEGRITY_SECRET no está configurado.");
  }
  const raw = `${params.reference}${params.amountInCents}${params.currency}${secret}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function buildWompiCheckoutFields(params: {
  reference: string;
  amountInCents: number;
  redirectUrl: string;
  customerEmail: string;
}) {
  const currency = "COP";
  return {
    "public-key": process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY!,
    "currency": currency,
    "amount-in-cents": String(params.amountInCents),
    "reference": params.reference,
    "signature:integrity": generateIntegritySignature({
      reference: params.reference,
      amountInCents: params.amountInCents,
      currency,
    }),
    "redirect-url": params.redirectUrl,
    "customer-data:email": params.customerEmail,
  };
}

/** Verifica la firma de un evento de webhook de Wompi. */
export function verifyWompiEventSignature(params: {
  properties: string[];
  data: Record<string, unknown>;
  timestamp: number;
  checksum: string;
}) {
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!eventsSecret) {
    throw new Error("WOMPI_EVENTS_SECRET no está configurado.");
  }
  const concatenatedValues = params.properties
    .map((prop) => {
      const path = prop.split(".");
      let value: unknown = params.data;
      for (const key of path) {
        value = (value as Record<string, unknown>)?.[key];
      }
      return value;
    })
    .join("");
  const raw = `${concatenatedValues}${params.timestamp}${eventsSecret}`;
  const expected = crypto.createHash("sha256").update(raw).digest("hex");
  return expected === params.checksum;
}

export type WompiTransaction = {
  id: string;
  reference: string;
  status: string;
  amountInCents: number;
  currency: string;
};

function wompiApiBase() {
  const key = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "";
  return key.startsWith("pub_test_")
    ? "https://sandbox.wompi.co/v1"
    : "https://production.wompi.co/v1";
}

/**
 * Le pregunta directamente a Wompi (servidor a servidor) por una
 * transacción. Wompi agrega ?id=<transacción> a la URL a la que vuelve el
 * cliente; ese id NO se cree tal cual: se consulta aquí y solo cuenta lo
 * que responda Wompi. Devuelve null si no existe o hay algún problema.
 */
export async function fetchWompiTransaction(id: string): Promise<WompiTransaction | null> {
  if (!/^[A-Za-z0-9_-]{5,80}$/.test(id)) return null;
  try {
    const res = await fetch(`${wompiApiBase()}/transactions/${encodeURIComponent(id)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Record<string, unknown> };
    const d = json.data;
    if (!d || typeof d.id !== "string") return null;
    return {
      id: d.id,
      reference: String(d.reference ?? ""),
      status: String(d.status ?? ""),
      amountInCents: Number(d.amount_in_cents ?? 0),
      currency: String(d.currency ?? ""),
    };
  } catch (error) {
    console.error("[wompi] No se pudo consultar la transacción:", error);
    return null;
  }
}
