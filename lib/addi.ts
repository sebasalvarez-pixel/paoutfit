import "server-only";

// Ambiente de Addi: "staging" (pruebas) o "production". Confirmado
// probando las credenciales contra el servidor real: son de producción
// (ver nota en .env). El endpoint de configuración de Addi sigue
// reportando la cuenta como inactiva ("isActiveAlly": false), así que
// aunque las llaves son reales, Addi mismo bloquea que se usen hasta que
// activen el aliado — getAddiConfig() ya revisa esto automáticamente.
const ADDI_ENV = process.env.ADDI_ENV === "staging" ? "staging" : "production";

const AUTH_URL =
  ADDI_ENV === "production"
    ? "https://auth.addi.com/oauth/token"
    : "https://auth.addi-staging.com/oauth/token";

const API_URL =
  ADDI_ENV === "production" ? "https://api.addi.com" : "https://api.addi-staging.com";

// Endpoint público (no requiere token) para saber si Addi debe mostrarse
// como opción de pago para un monto dado. Ojo: el manual de Addi trae esta
// URL escrita con puntos ("channels.public.api...") en un lugar y con
// guiones en otro — la que de verdad resuelve es la de guiones.
const CONFIG_URL = "https://channels-public-api.addi.com";

const ALLY_SLUG = process.env.ADDI_ALLY_SLUG ?? "paoutfit-ecommerce";

export function isAddiConfigured() {
  return Boolean(process.env.ADDI_CLIENT_ID && process.env.ADDI_CLIENT_SECRET);
}

type AddiConfigResponse = {
  minAmount: number;
  maxAmount: number;
  isActiveAlly: boolean;
  isActivePayNow: boolean;
};

/** Consulta si Addi acepta un monto dado para este comercio ahora mismo. */
export async function getAddiConfig(
  amountCop: number,
): Promise<AddiConfigResponse | null> {
  try {
    const res = await fetch(
      `${CONFIG_URL}/allies/${ALLY_SLUG}/config?requestedamount=${amountCop}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    return (await res.json()) as AddiConfigResponse;
  } catch {
    return null;
  }
}

/**
 * Autenticación OAuth2 (Auth0, client_credentials) — Addi pide generar un
 * token nuevo por cada intento de transacción, no reutilizarlo.
 * https://api-docs-sandbox.addi.com/auth/
 */
async function getAddiToken(): Promise<string> {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.ADDI_CLIENT_ID,
      client_secret: process.env.ADDI_CLIENT_SECRET,
      // Confirmado probando contra el servidor real: es la URL del API.
      audience: process.env.ADDI_AUDIENCE ?? API_URL,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`No se pudo autenticar con Addi (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export type AddiApplicationInput = {
  orderNumber: string;
  totalCop: number;
  shippingCop: number;
  items: { sku: string; name: string; quantity: number; unitPriceCop: number }[];
  customer: {
    idNumber: string;
    fullName: string;
    email: string;
    phone: string;
  };
  address: { line1: string; city: string };
  callbackUrl: string;
  redirectionUrl: string;
};

export type AddiApplicationResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string };

/**
 * Crea la solicitud de crédito en línea y devuelve la URL de Addi a la que
 * hay que redirigir al cliente. Addi responde con un HTTP 301 (sin cuerpo)
 * y el header Location — por eso se pide la respuesta con
 * redirect:"manual" y se lee el header a mano en vez de dejar que fetch
 * siga la redirección automáticamente (el manual de integración advierte
 * que seguirla automáticamente pierde parámetros).
 */
export async function createAddiApplication(
  input: AddiApplicationInput,
): Promise<AddiApplicationResult> {
  const token = await getAddiToken();

  const [firstName, ...rest] = input.customer.fullName.trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;

  const body = {
    orderId: input.orderNumber,
    totalAmount: input.totalCop.toFixed(1),
    shippingAmount: input.shippingCop.toFixed(1),
    currency: "COP",
    items: input.items.map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPriceCop),
    })),
    client: {
      idType: "CC",
      idNumber: input.customer.idNumber,
      firstName,
      lastName,
      email: input.customer.email,
      cellphone: input.customer.phone.replace(/\D/g, ""),
      cellphoneCountryCode: "+57",
      address: {
        lineOne: input.address.line1,
        city: input.address.city,
        country: "CO",
      },
    },
    allyUrlRedirection: {
      callbackUrl: input.callbackUrl,
      redirectionUrl: input.redirectionUrl,
    },
  };

  const res = await fetch(`${API_URL}/v1/online-applications`, {
    method: "POST",
    redirect: "manual",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 301) {
    const location = res.headers.get("location");
    if (location) return { ok: true, redirectUrl: location };
  }

  const errorBody = (await res.json().catch(() => null)) as
    | { code?: string; message?: string }
    | null;
  return {
    ok: false,
    error: errorBody?.message ?? `Addi respondió con un error inesperado (${res.status}).`,
  };
}

/** Verifica el Basic Auth que Addi envía en cada notificación (webhook). */
export function verifyAddiWebhookAuth(authorizationHeader: string | null): boolean {
  const expectedUser = process.env.ADDI_WEBHOOK_USERNAME;
  const expectedPass = process.env.ADDI_WEBHOOK_PASSWORD;
  if (!expectedUser || !expectedPass) return false;
  if (!authorizationHeader?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(authorizationHeader.slice(6), "base64").toString("utf-8");
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const user = decoded.slice(0, separatorIndex);
  const pass = decoded.slice(separatorIndex + 1);
  return user === expectedUser && pass === expectedPass;
}

/** "approved" es el único estado exitoso; todo lo demás es un rechazo. */
export function isAddiStatusApproved(status: string) {
  return status.toUpperCase() === "APPROVED";
}
