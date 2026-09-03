"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatCop } from "@/lib/format";
import { createOrder, devSimulatePayment } from "./actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const total = cartTotal(items);
  const formRef = useRef<HTMLFormElement>(null);
  const wompiFormRef = useRef<HTMLFormElement>(null);
  const [wompiFields, setWompiFields] = useState<Record<string, string> | null>(
    null,
  );
  const [wompiUrl, setWompiUrl] = useState<string>("");
  const [devOrderId, setDevOrderId] = useState<string | null>(null);
  const [orderNumberForDev, setOrderNumberForDev] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (items.length === 0 && !devOrderId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-heading text-3xl text-ink mb-4">
          Tu carrito está vacío
        </h1>
        <p className="text-ink/60">Agrega productos antes de pagar.</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createOrder({
        customerName: String(form.get("customerName") ?? ""),
        customerEmail: String(form.get("customerEmail") ?? ""),
        customerPhone: String(form.get("customerPhone") ?? ""),
        addressLine1: String(form.get("addressLine1") ?? ""),
        addressLine2: String(form.get("addressLine2") ?? ""),
        city: String(form.get("city") ?? ""),
        department: String(form.get("department") ?? ""),
        discountCode: String(form.get("discountCode") ?? "") || undefined,
        acceptedDataPolicy: form.get("acceptedDataPolicy") === "on",
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (result.wompi) {
        setWompiFields(result.wompi);
        setWompiUrl(result.wompiCheckoutUrl);
        setTimeout(() => wompiFormRef.current?.submit(), 50);
        return;
      }

      if (result.devPaymentAvailable) {
        setDevOrderId(result.orderId);
        setOrderNumberForDev(result.orderNumber);
        return;
      }

      setError(
        "La pasarela de pago todavía no está configurada. Contacta al equipo.",
      );
    });
  }

  function handleSimulatePayment() {
    if (!devOrderId || !orderNumberForDev) return;
    startTransition(async () => {
      await devSimulatePayment(devOrderId);
      clear();
      router.push(`/pedido-confirmado/${orderNumberForDev}`);
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-12">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="lg:col-span-2 space-y-6"
      >
        <h1 className="font-heading text-3xl text-ink">Finalizar compra</h1>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wide text-ink/60">
            Contacto
          </h2>
          <input
            name="customerName"
            required
            placeholder="Nombre completo"
            className="w-full border border-ink/20 px-3 py-2 bg-white"
          />
          <input
            name="customerEmail"
            type="email"
            required
            placeholder="Correo electrónico"
            className="w-full border border-ink/20 px-3 py-2 bg-white"
          />
          <input
            name="customerPhone"
            required
            placeholder="Teléfono"
            className="w-full border border-ink/20 px-3 py-2 bg-white"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wide text-ink/60">
            Dirección de envío
          </h2>
          <input
            name="addressLine1"
            required
            placeholder="Dirección"
            className="w-full border border-ink/20 px-3 py-2 bg-white"
          />
          <input
            name="addressLine2"
            placeholder="Apartamento, casa, etc. (opcional)"
            className="w-full border border-ink/20 px-3 py-2 bg-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="city"
              required
              placeholder="Ciudad"
              className="w-full border border-ink/20 px-3 py-2 bg-white"
            />
            <input
              name="department"
              required
              placeholder="Departamento"
              className="w-full border border-ink/20 px-3 py-2 bg-white"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wide text-ink/60">
            Código de descuento
          </h2>
          <input
            name="discountCode"
            placeholder="Ej. BIENVENIDA5"
            className="w-full border border-ink/20 px-3 py-2 bg-white uppercase"
          />
        </section>

        <label className="flex items-start gap-2 text-xs text-ink/70">
          <input
            type="checkbox"
            name="acceptedDataPolicy"
            required
            className="mt-0.5"
          />
          <span>
            He leído y acepto la{" "}
            <a
              href="/tratamiento-de-datos"
              target="_blank"
              className="text-rose underline"
            >
              política de tratamiento de datos personales
            </a>
            .
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {devOrderId ? (
          <div className="bg-blush p-4 text-sm space-y-3">
            <p className="text-ink">
              Modo desarrollo: Wompi aún no está conectado con llaves reales.
              Pedido <strong>{orderNumberForDev}</strong> creado en estado
              pendiente.
            </p>
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isPending}
              className="bg-rose text-white px-6 py-2 uppercase text-sm tracking-wide hover:bg-plum transition-colors disabled:opacity-60"
            >
              {isPending ? "Procesando..." : "Simular pago aprobado"}
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-rose text-white py-3 uppercase text-sm tracking-wide hover:bg-plum transition-colors disabled:opacity-60"
          >
            {isPending ? "Procesando..." : "Pagar ahora"}
          </button>
        )}
      </form>

      <div className="bg-blush p-6 h-fit">
        <h2 className="font-heading text-xl mb-4">Resumen</h2>
        <ul className="space-y-2 text-sm mb-4">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between">
              <span>
                {item.productTitle} ({item.colorName}) × {item.quantity}
              </span>
              <span>{formatCop(item.unitPriceCop * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-sm font-semibold border-t border-ink/10 pt-3">
          <span>Subtotal</span>
          <span>{formatCop(total)}</span>
        </div>
        <p className="text-xs text-ink/60 mt-2">
          Envío e impuestos se calculan al confirmar.
        </p>
      </div>

      {/* Formulario oculto que envía a Wompi Web Checkout */}
      {wompiFields && (
        <form
          ref={wompiFormRef}
          action={wompiUrl}
          method="GET"
          className="hidden"
        >
          {Object.entries(wompiFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}
    </div>
  );
}
