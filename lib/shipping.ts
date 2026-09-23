// Reglas de envío en un solo lugar: las usan el servidor (para cobrar) y el
// navegador (para mostrar el resumen), así lo que se ve es lo que se cobra.

/** Tarifa fija de envío nacional, en pesos colombianos. */
export const NATIONAL_SHIPPING_COP = 16000;

/** Envío nacional gratis desde este valor (después de descuentos). */
export const FREE_SHIPPING_THRESHOLD_COP = 280000;

/** Rango aproximado del envío internacional (DHL), en dólares. Se cotiza a mano. */
export const INTERNATIONAL_SHIPPING_USD_MIN = 100;
export const INTERNATIONAL_SHIPPING_USD_MAX = 160;

export function nationalShippingCop(subtotalAfterDiscountCop: number): number {
  return subtotalAfterDiscountCop >= FREE_SHIPPING_THRESHOLD_COP
    ? 0
    : NATIONAL_SHIPPING_COP;
}

export function amountToFreeShippingCop(subtotalAfterDiscountCop: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_COP - subtotalAfterDiscountCop);
}
