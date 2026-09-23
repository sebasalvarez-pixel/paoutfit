"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatCop } from "@/lib/format";
import { useLocale } from "@/components/LocaleProvider";
import { OrderTotals } from "@/components/storefront/OrderTotals";
import { translateColorName } from "@/lib/i18n/dictionary";
import { createOrder, devSimulatePayment, getAddiAvailability } from "./actions";

// Solo sugerencias para el campo de país (es texto libre): los países a los
// que más probablemente se envíe. La cotización con DHL se hace a mano.
const COUNTRY_SUGGESTIONS = [
  "Estados Unidos / United States",
  "Canadá / Canada",
  "México",
  "España / Spain",
  "Chile",
  "Perú",
  "Ecuador",
  "Argentina",
  "Panamá",
  "Costa Rica",
  "República Dominicana",
  "Reino Unido / United Kingdom",
  "Francia / France",
  "Alemania / Germany",
  "Italia / Italy",
  "Australia",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const total = cartTotal(items);
  const { t, locale } = useLocale();
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
  const [addiAvailable, setAddiAvailable] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wompi" | "addi">("wompi");
  const [redirectingToAddi, setRedirectingToAddi] = useState(false);
  const [shippingMode, setShippingMode] = useState<"national" | "international">(
    "national",
  );
  const [hasDiscountCode, setHasDiscountCode] = useState(false);
  const isInternational = shippingMode === "international";
  // Addi solo existe para Colombia: en envíos internacionales siempre se
  // usa la pasarela normal (el link de pago se manda después de cotizar).
  const effectiveMethod = isInternational ? "wompi" : paymentMethod;

  useEffect(() => {
    if (total <= 0) return;
    getAddiAvailability(total).then((result) => {
      setAddiAvailable(result.available && result.inRange);
    });
  }, [total]);

  if (items.length === 0 && !devOrderId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-heading text-3xl text-ink mb-4">
          {t("checkout_carrito_vacio")}
        </h1>
        <p className="text-ink/60">{t("checkout_agrega_productos")}</p>
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
        customerIdNumber: String(form.get("customerIdNumber") ?? "") || undefined,
        addressLine1: String(form.get("addressLine1") ?? ""),
        addressLine2: String(form.get("addressLine2") ?? ""),
        city: String(form.get("city") ?? ""),
        department: String(form.get("department") ?? ""),
        country: String(form.get("country") ?? "") || undefined,
        postalCode: String(form.get("postalCode") ?? "") || undefined,
        shippingMode,
        locale,
        discountCode: String(form.get("discountCode") ?? "") || undefined,
        paymentMethod: effectiveMethod,
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

      if (result.quoteRequested) {
        clear();
        router.push(`/pedido-confirmado/${result.orderNumber}`);
        return;
      }

      if (result.addiRedirectUrl) {
        // El carrito se vacía al confirmarse el pago (OrderStatusWatcher),
        // así si el cliente cancela en Addi no pierde lo que había elegido.
        setRedirectingToAddi(true);
        window.location.href = result.addiRedirectUrl;
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

      setError(t("checkout_pasarela_no_configurada"));
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
        <h1 className="font-heading text-3xl text-ink">{t("checkout_title")}</h1>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wide text-ink/60">
            {t("checkout_tipo_envio")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(["national", "international"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setShippingMode(mode)}
                className={`px-4 py-3 text-sm border transition-colors ${
                  shippingMode === mode
                    ? "border-rose text-rose"
                    : "border-ink/20 text-ink/70 hover:border-ink/50"
                }`}
              >
                {mode === "national"
                  ? t("checkout_envio_nacional")
                  : t("checkout_envio_internacional")}
              </button>
            ))}
          </div>
          {isInternational && (
            <p className="text-xs text-ink/60 bg-blush px-3 py-2">
              {t("checkout_intl_aviso")}
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wide text-ink/60">
            {t("checkout_contacto")}
          </h2>
          <input
            name="customerName"
            required
            placeholder={t("checkout_nombre")}
            className="w-full border border-ink/20 px-3 py-2 bg-white"
          />
          <input
            name="customerEmail"
            type="email"
            required
            placeholder={t("checkout_correo")}
            className="w-full border border-ink/20 px-3 py-2 bg-white"
          />
          <input
            name="customerPhone"
            required
            placeholder={
              isInternational ? t("checkout_telefono_intl") : t("checkout_telefono")
            }
            className="w-full border border-ink/20 px-3 py-2 bg-white"
          />
          {effectiveMethod === "addi" && (
            <input
              name="customerIdNumber"
              required
              placeholder={t("checkout_cedula")}
              className="w-full border border-ink/20 px-3 py-2 bg-white"
            />
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wide text-ink/60">
            {t("checkout_direccion_envio")}
          </h2>
          {isInternational && (
            <>
              <input
                name="country"
                list="paises"
                required
                placeholder={t("checkout_pais")}
                className="w-full border border-ink/20 px-3 py-2 bg-white"
              />
              <datalist id="paises">
                {COUNTRY_SUGGESTIONS.map((country) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
            </>
          )}
          <input
            name="addressLine1"
            required
            placeholder={t("checkout_direccion")}
            className="w-full border border-ink/20 px-3 py-2 bg-white"
          />
          <input
            name="addressLine2"
            placeholder={t("checkout_apartamento")}
            className="w-full border border-ink/20 px-3 py-2 bg-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="city"
              required
              placeholder={t("checkout_ciudad")}
              className="w-full border border-ink/20 px-3 py-2 bg-white"
            />
            <input
              name="department"
              required={!isInternational}
              placeholder={
                isInternational
                  ? t("checkout_estado_provincia")
                  : t("checkout_departamento")
              }
              className="w-full border border-ink/20 px-3 py-2 bg-white"
            />
          </div>
          {isInternational && (
            <input
              name="postalCode"
              placeholder={t("checkout_codigo_postal")}
              className="w-full border border-ink/20 px-3 py-2 bg-white"
            />
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wide text-ink/60">
            {t("checkout_codigo_descuento")}
          </h2>
          <input
            name="discountCode"
            onChange={(e) => setHasDiscountCode(e.target.value.trim() !== "")}
            placeholder="Ej. BIENVENIDA5"
            className="w-full border border-ink/20 px-3 py-2 bg-white uppercase"
          />
        </section>

        {addiAvailable && !isInternational && (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-wide text-ink/60">
              {t("checkout_metodo_pago")}
            </h2>
            <div className="space-y-2" role="radiogroup">
              {(
                [
                  {
                    id: "wompi",
                    title: t("checkout_pagar_tarjeta_pse"),
                    desc: t("checkout_pago_tarjeta_desc"),
                    icon: (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        aria-hidden="true"
                      >
                        <rect x="2.5" y="5" width="19" height="14" rx="2" />
                        <path d="M2.5 10h19M6 15h4" />
                      </svg>
                    ),
                  },
                  {
                    id: "addi",
                    title: t("checkout_pagar_addi"),
                    desc: t("checkout_pago_addi_desc"),
                    icon: (
                      <span className="text-base font-semibold lowercase leading-none tracking-tight">
                        addi
                      </span>
                    ),
                  },
                ] as const
              ).map((m) => {
                const selected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex w-full items-center gap-3 border bg-white px-4 py-3 text-left transition-colors ${
                      selected
                        ? "border-rose ring-1 ring-rose"
                        : "border-ink/20 hover:border-ink/50"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-12 shrink-0 items-center justify-center rounded ${
                        selected ? "bg-rose text-white" : "bg-blush text-ink/70"
                      }`}
                    >
                      {m.icon}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm text-ink">{m.title}</span>
                      <span className="block text-xs text-ink/60">{m.desc}</span>
                    </span>
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected ? "border-rose" : "border-ink/30"
                      }`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-rose" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <label className="flex items-start gap-2 text-xs text-ink/70">
          <input
            type="checkbox"
            name="acceptedDataPolicy"
            required
            className="mt-0.5"
          />
          <span>
            {t("checkout_acepto_prefix")}{" "}
            <a
              href="/tratamiento-de-datos"
              target="_blank"
              className="text-rose underline"
            >
              {t("checkout_politica_datos")}
            </a>{" "}
            {t("checkout_y_los")}{" "}
            <a
              href="/terminos-y-condiciones"
              target="_blank"
              className="text-rose underline"
            >
              {t("footer_terminos")}
            </a>
            .
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {devOrderId ? (
          <div className="bg-blush p-4 text-sm space-y-3">
            <p className="text-ink">
              {t("checkout_dev_mode")} <strong>{orderNumberForDev}</strong>
            </p>
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isPending}
              className="bg-rose text-white px-6 py-2 uppercase text-sm tracking-wide hover:bg-plum transition-colors disabled:opacity-60"
            >
              {isPending ? t("checkout_procesando") : t("checkout_simular_pago")}
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isPending || redirectingToAddi}
            className="w-full bg-rose text-white py-3 uppercase text-sm tracking-wide hover:bg-plum transition-colors disabled:opacity-60"
          >
            {redirectingToAddi
              ? t("checkout_redirigiendo_addi")
              : isPending
                ? t("checkout_procesando")
                : isInternational
                  ? t("checkout_solicitar_cotizacion")
                  : t("checkout_pagar_ahora")}
          </button>
        )}
      </form>

      <div className="bg-blush p-6 h-fit">
        <h2 className="font-heading text-xl mb-4">{t("checkout_resumen")}</h2>
        <ul className="space-y-2 text-sm mb-4">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between">
              <span>
                {item.productTitle} ({translateColorName(locale, item.colorName)}) ×{" "}
                {item.quantity}
              </span>
              <span>{formatCop(item.unitPriceCop * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-ink/10 pt-3">
          <OrderTotals subtotalCop={total} international={isInternational} />
        </div>
        {hasDiscountCode && (
          <p className="text-xs text-ink/60 mt-2">{t("ship_descuento_nota")}</p>
        )}
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
