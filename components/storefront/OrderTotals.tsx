"use client";

import { formatCop } from "@/lib/format";
import { useLocale } from "@/components/LocaleProvider";
import {
  FREE_SHIPPING_THRESHOLD_COP,
  INTERNATIONAL_SHIPPING_USD_MAX,
  INTERNATIONAL_SHIPPING_USD_MIN,
  NATIONAL_SHIPPING_NEIVA_COP,
  amountToFreeShippingCop,
  nationalShippingCop,
  shippingZoneFor,
} from "@/lib/shipping";
import { paymentFeeCop, type PaymentMethodKey } from "@/lib/payment-fees";

/**
 * Subtotal, envío y total, más el aviso de cuánto falta para envío gratis.
 * Se usa en el carrito, en el panel del carrito y en el checkout, para que
 * el cliente vea el valor final antes de pagar (nada de sorpresas en Addi).
 * `city`/`department` ajustan el envío en vivo cuando ya se conocen
 * (checkout); sin ellos se muestra la tarifa base nacional.
 */
export function OrderTotals({
  subtotalCop,
  international = false,
  showTotal = true,
  city,
  department,
  paymentMethod,
}: {
  subtotalCop: number;
  international?: boolean;
  showTotal?: boolean;
  city?: string;
  department?: string;
  /** Método elegido; sin él (carrito) no se suma el costo del pago, solo se avisa. */
  paymentMethod?: PaymentMethodKey;
}) {
  const { t } = useLocale();

  const shippingCop = nationalShippingCop(subtotalCop, city, department);
  const missing = amountToFreeShippingCop(subtotalCop);
  const progress = Math.min(100, (subtotalCop / FREE_SHIPPING_THRESHOLD_COP) * 100);
  const feeCop =
    !international && paymentMethod
      ? paymentFeeCop(paymentMethod, subtotalCop + shippingCop)
      : 0;
  const zoneKnown = shippingZoneFor(city, department) !== "national" || Boolean(city || department);

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>{t("cart_subtotal")}</span>
        <span>{formatCop(subtotalCop)}</span>
      </div>

      {international ? (
        <>
          <div className="flex justify-between gap-4">
            <span>{t("ship_label")}</span>
            <span className="text-right font-medium text-rose">
              {t("ship_a_cotizar")}
            </span>
          </div>
          <p className="text-xs text-ink/60">
            {t("ship_intl_rango")} USD {INTERNATIONAL_SHIPPING_USD_MIN} –{" "}
            USD {INTERNATIONAL_SHIPPING_USD_MAX}. {t("ship_intl_nota")}
          </p>
        </>
      ) : (
        <>
          <div className="flex justify-between">
            <span>{t("ship_label")}</span>
            <span className={shippingCop === 0 ? "text-green-700 font-medium" : ""}>
              {shippingCop === 0 ? t("ship_gratis") : formatCop(shippingCop)}
            </span>
          </div>
          {!zoneKnown && shippingCop > 0 && (
            <p className="text-[11px] text-ink/50">
              {t("ship_varia_ciudad_prefix")} {formatCop(NATIONAL_SHIPPING_NEIVA_COP)}{" "}
              {t("ship_varia_ciudad_sufijo")}
            </p>
          )}

          {paymentMethod && feeCop > 0 && (
            <div className="flex justify-between">
              <span>
                {t("ship_costo_pago")}
              </span>
              <span>{formatCop(feeCop)}</span>
            </div>
          )}

          {missing > 0 ? (
            <div className="pt-1">
              <p className="text-xs text-ink/70">
                {t("ship_faltan_prefix")}{" "}
                <strong className="text-rose">{formatCop(missing)}</strong>{" "}
                {t("ship_faltan_sufijo")}
              </p>
              <div className="mt-1.5 h-1.5 w-full bg-ink/10 overflow-hidden">
                <div
                  className="h-full bg-rose transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-green-700">{t("ship_ya_gratis")}</p>
          )}
        </>
      )}

      {showTotal && (
        <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-semibold">
          <span>{t("track_total")}</span>
          <span className="text-rose">
            {international
              ? formatCop(subtotalCop)
              : formatCop(subtotalCop + shippingCop + feeCop)}
          </span>
        </div>
      )}
      {showTotal && international && (
        <p className="text-xs text-ink/60">{t("ship_total_mas_envio")}</p>
      )}
      {showTotal && !international && !paymentMethod && (
        <p className="text-xs text-ink/60">
          {t("ship_costo_pago_nota")}
        </p>
      )}
    </div>
  );
}
