import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "PAOUTFIT <onboarding@resend.dev>";

/**
 * Envía un correo con Resend. Nunca lanza una excepción: un correo es
 * "mejor esfuerzo" y no debe tumbar el flujo de pago si Resend lo
 * rechaza (por ejemplo, en modo sandbox solo se puede enviar al correo
 * de la cuenta) o si hay un problema de red. Los fallos solo se
 * registran en consola.
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

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      react: params.react,
    });

    if (result.error) {
      console.error(
        `[email] Resend rechazó el envío a ${params.to} ("${params.subject}"):`,
        result.error,
      );
      return { skipped: true, error: result.error } as const;
    }

    return result;
  } catch (err) {
    console.error(
      `[email] Falló el envío a ${params.to} ("${params.subject}"):`,
      err,
    );
    return { skipped: true, error: err } as const;
  }
}
