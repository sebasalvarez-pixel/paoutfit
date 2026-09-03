"use client";

import { useState, useTransition } from "react";
import { formatCop } from "@/lib/format";
import { lookupOrder, type LookupResult } from "./actions";

export default function TrackOrderPage() {
  const [result, setResult] = useState<LookupResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await lookupOrder({
        orderNumber: String(form.get("orderNumber") ?? ""),
        email: String(form.get("email") ?? ""),
      });
      setResult(res);
    });
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-3xl text-ink mb-2 text-center">
        Rastrea tu pedido
      </h1>
      <p className="text-ink/60 text-sm text-center mb-8">
        Ingresa tu número de pedido y el correo con el que compraste.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="orderNumber"
          required
          placeholder="Número de pedido, ej. PAO-ABC123"
          className="w-full border border-ink/20 px-3 py-2 bg-white uppercase"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Correo electrónico"
          className="w-full border border-ink/20 px-3 py-2 bg-white"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-rose text-white py-3 uppercase text-sm tracking-wide hover:bg-plum transition-colors disabled:opacity-60"
        >
          {isPending ? "Buscando..." : "Buscar pedido"}
        </button>
      </form>

      {result && !result.ok && (
        <p className="text-sm text-red-600 mt-6 text-center">{result.error}</p>
      )}

      {result && result.ok && (
        <div className="mt-8 bg-blush p-6">
          <p className="text-sm text-ink/70">
            Pedido <strong>{result.orderNumber}</strong>
          </p>
          <p className="text-lg text-rose mt-1">{result.statusLabel}</p>

          {result.trackingNumber && (
            <div className="mt-4 bg-white p-4 text-sm">
              <p className="text-ink/60">
                Enviado con <strong>{result.carrier ?? "ENVIA"}</strong>
              </p>
              <p className="mt-1">
                Número de guía: <strong>{result.trackingNumber}</strong>
              </p>
              <p className="text-xs text-ink/50 mt-2">
                Escríbenos por WhatsApp con este número si quieres que te
                ayudemos a consultar el estado exacto de tu envío.
              </p>
            </div>
          )}

          <ul className="mt-4 divide-y divide-ink/10">
            {result.items.map((item, i) => (
              <li key={i} className="py-2 text-sm flex justify-between">
                <span>
                  {item.title} ({item.color}) × {item.quantity}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between font-semibold mt-4 pt-3 border-t border-ink/10">
            <span>Total</span>
            <span>{formatCop(result.totalCop)}</span>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-ink/50 mt-10">
        ¿Necesitas ayuda con tu pedido? Escríbenos por{" "}
        <a
          href="https://wa.me/573114857551"
          target="_blank"
          rel="noreferrer"
          className="text-rose underline"
        >
          WhatsApp
        </a>{" "}
        o revisa nuestra{" "}
        <a href="/informacion" className="text-rose underline">
          página de información
        </a>
        .
      </p>
    </div>
  );
}
