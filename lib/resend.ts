import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "PAOUTFIT <onboarding@resend.dev>";

/**
 * Envía un correo con Resend. Si todavía no hay una llave configurada
 * (estamos en desarrollo local, por ejemplo), no falla: solo lo avisa
 * por consola para que el flujo se pueda seguir probando sin bloquearse.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY no configurada — se omite el envío a ${params.to} ("${params.subject}").`,
    );
    return { skipped: true } as const;
  }

  const result = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.subject,
    react: params.react,
  });

  return result;
}
