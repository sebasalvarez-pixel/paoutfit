import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCop } from "@/lib/format";
import { getLocale } from "@/lib/i18n/get-locale";
import { t, translateColorName } from "@/lib/i18n/dictionary";
import {
  buildWompiCheckoutFields,
  isWompiConfigured,
  WOMPI_CHECKOUT_URL,
} from "@/lib/wompi";
import { LocaleFromQuery } from "@/components/LocaleFromQuery";

export const metadata = { robots: { index: false, follow: false } };

/**
 * Página de pago para pedidos internacionales: el cliente llega aquí desde
 * el correo con el link, DESPUÉS de que la dueña cotizó el envío con DHL.
 * Solo se puede pagar un pedido internacional, ya cotizado y aún pendiente.
 */
export default async function PayOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { orderNumber } = await params;
  const { lang } = await searchParams;
  const locale = await getLocale();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order || !order.isInternational) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const canPay = order.status === "pending" && !order.shippingQuotePending;

  let message: string | null = null;
  if (order.shippingQuotePending) message = t(locale, "pay_no_cotizado");
  else if (order.status !== "pending") message = t(locale, "pay_no_disponible");
  else if (!isWompiConfigured()) message = t(locale, "pay_sin_pasarela");

  const wompiFields =
    canPay && isWompiConfigured()
      ? buildWompiCheckoutFields({
          reference: order.orderNumber,
          amountInCents: order.totalCop * 100,
          redirectUrl: `${appUrl}/pedido-confirmado/${order.orderNumber}`,
          customerEmail: order.customerEmail,
        })
      : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <LocaleFromQuery lang={lang === "en" || lang === "es" ? lang : null} />
      <h1 className="font-heading text-3xl text-ink text-center mb-2">
        {t(locale, "pay_title")}
      </h1>
      <p className="text-center text-ink/60 mb-8">
        {t(locale, "track_pedido")} <strong>{order.orderNumber}</strong>
      </p>

      <ul className="divide-y divide-ink/10 mb-6">
        {order.items.map((item) => (
          <li key={item.id} className="py-3 flex justify-between text-sm">
            <span>
              {item.productTitle} ({translateColorName(locale, item.colorName)}) ×{" "}
              {item.quantity}
            </span>
            <span>{formatCop(item.unitPriceCop * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-1 text-sm mb-6">
        <div className="flex justify-between text-ink/70">
          <span>{t(locale, "cart_subtotal")}</span>
          <span>{formatCop(order.subtotalCop)}</span>
        </div>
        {order.discountCop > 0 && (
          <div className="flex justify-between text-ink/70">
            <span>{locale === "en" ? "Discount" : "Descuento"}</span>
            <span>-{formatCop(order.discountCop)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink/70">
          <span>{t(locale, "pay_envio_intl")}</span>
          <span>{order.shippingQuotePending ? "—" : formatCop(order.shippingCop)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2 border-t border-ink/10">
          <span>{t(locale, "track_total")}</span>
          <span className="text-rose">{formatCop(order.totalCop)}</span>
        </div>
      </div>

      {message && (
        <p className="text-sm text-ink/70 bg-blush px-4 py-3 text-center">{message}</p>
      )}

      {wompiFields && (
        <form action={WOMPI_CHECKOUT_URL} method="GET">
          {Object.entries(wompiFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <button
            type="submit"
            className="w-full bg-rose text-white py-3 uppercase text-sm tracking-wide hover:bg-plum transition-colors"
          >
            {t(locale, "pay_boton")}
          </button>
        </form>
      )}
    </div>
  );
}
