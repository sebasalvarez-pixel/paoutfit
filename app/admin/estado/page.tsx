import { ownerRecipients } from "@/lib/resend";
import { isAddiConfigured } from "@/lib/addi";

export const dynamic = "force-dynamic";

type Check = { label: string; ok: boolean; detail?: string };

// Solo se muestran "sí / no" y pistas de formato: NUNCA los valores de las
// llaves. Sirve para saber si el sitio publicado de verdad recibió cada
// variable de Netlify.
function wompiChecks(): Check[] {
  const pub = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "";
  const integrity = process.env.WOMPI_INTEGRITY_SECRET ?? "";
  const events = process.env.WOMPI_EVENTS_SECRET ?? "";
  const spaces = (v: string) => v !== v.trim();

  return [
    {
      label: "Llave pública de Wompi (NEXT_PUBLIC_WOMPI_PUBLIC_KEY)",
      ok: pub.startsWith("pub_prod_") && !spaces(pub),
      detail: !pub
        ? "El sitio no la recibió. Falta crearla, o el despliegue es anterior a crearla."
        : !pub.startsWith("pub_prod_")
          ? "Está, pero no empieza con pub_prod_ (¿es una llave de pruebas o está mal copiada?)."
          : spaces(pub)
            ? "Tiene un espacio al inicio o al final. Vuelve a pegarla sin espacios."
            : undefined,
    },
    {
      label: "Secreto de integridad (WOMPI_INTEGRITY_SECRET)",
      ok: integrity.startsWith("prod_integrity_") && !spaces(integrity),
      detail: !integrity
        ? "El sitio no lo recibió."
        : !integrity.startsWith("prod_integrity_")
          ? "Está, pero no empieza con prod_integrity_."
          : spaces(integrity)
            ? "Tiene un espacio al inicio o al final."
            : undefined,
    },
    {
      label: "Secreto de eventos (WOMPI_EVENTS_SECRET)",
      ok: events.startsWith("prod_events_") && !spaces(events),
      detail: !events
        ? "El sitio no lo recibió. Sin él, los pagos aprobados no cambian el pedido a Pagado."
        : !events.startsWith("prod_events_")
          ? "Está, pero no empieza con prod_events_."
          : spaces(events)
            ? "Tiene un espacio al inicio o al final."
            : undefined,
    },
  ];
}

function otherChecks(): Check[] {
  const from = process.env.RESEND_FROM_EMAIL ?? "";
  const sandbox = !from || from.includes("onboarding@resend.dev");
  return [
    {
      label: "Correos (Resend) con dominio propio",
      ok: Boolean(process.env.RESEND_API_KEY) && !sandbox,
      detail: !process.env.RESEND_API_KEY
        ? "Falta RESEND_API_KEY."
        : sandbox
          ? "Está en modo de pruebas: solo llegan correos a la cuenta de Resend, no a clientes."
          : undefined,
    },
    {
      label: "Avisos de venta a la tienda",
      ok: ownerRecipients().length > 0,
      detail:
        ownerRecipients().length > 0
          ? `${ownerRecipients().length} correo(s) configurado(s).`
          : "Falta OWNER_NOTIFICATION_EMAIL.",
    },
    {
      label: "Addi",
      ok: isAddiConfigured(),
      detail: isAddiConfigured() ? undefined : "Faltan las credenciales de Addi.",
    },
    {
      label: "Contraseña del panel cambiada",
      ok: process.env.ADMIN_PASSWORD !== "cambiame123",
      detail:
        process.env.ADMIN_PASSWORD === "cambiame123"
          ? "Sigue la contraseña por defecto (cambiame123). Cámbiala en Netlify antes de entregar."
          : undefined,
    },
    {
      label: "Dirección pública del sitio (NEXT_PUBLIC_APP_URL)",
      ok: Boolean(process.env.NEXT_PUBLIC_APP_URL) && !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost"),
      detail: process.env.NEXT_PUBLIC_APP_URL ? undefined : "Falta definirla.",
    },
  ];
}

function Row({ check }: { check: Check }) {
  return (
    <li className="flex gap-3 px-4 py-3">
      <span className={check.ok ? "text-emerald-600" : "text-red-600"} aria-hidden="true">
        {check.ok ? "✓" : "✗"}
      </span>
      <div>
        <p className="text-sm text-ink">{check.label}</p>
        {check.detail && (
          <p className={`text-xs mt-0.5 ${check.ok ? "text-ink/50" : "text-red-700"}`}>
            {check.detail}
          </p>
        )}
      </div>
    </li>
  );
}

export default function AdminStatusPage() {
  const wompi = wompiChecks();
  const others = otherChecks();
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-ink">Estado de la tienda</h1>
        <p className="text-sm text-ink/60 mt-2">
          Revisa si el sitio publicado recibió cada configuración. Nunca muestra
          las llaves, solo si están o no. Si acabas de cambiar algo en Netlify,
          recuerda hacer un nuevo despliegue.
        </p>
      </div>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-2">Wompi (pagos con tarjeta y PSE)</h2>
        <ul className="bg-white border border-ink/10 rounded divide-y divide-ink/10">
          {wompi.map((c) => (
            <Row key={c.label} check={c} />
          ))}
        </ul>
        <p className="text-xs text-ink/50 mt-2">
          Además hay que registrar en el panel de Wompi la URL de eventos:{" "}
          <code>{(process.env.NEXT_PUBLIC_APP_URL ?? "")}/api/webhooks/wompi</code>
        </p>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-2">Otras configuraciones</h2>
        <ul className="bg-white border border-ink/10 rounded divide-y divide-ink/10">
          {others.map((c) => (
            <Row key={c.label} check={c} />
          ))}
        </ul>
      </section>
    </div>
  );
}
