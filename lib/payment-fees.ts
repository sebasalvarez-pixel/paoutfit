// Costo del medio de pago, en un solo lugar (igual que lib/shipping.ts): lo usa
// el servidor para cobrar y el navegador para mostrarlo antes de pagar.
//
// Es el porcentaje que cobra cada plataforma a la tienda, trasladado al cliente
// según el método que elija. Para quitarlo, basta poner 0 en el método.

export type PaymentMethodKey = "wompi" | "addi";

/** Porcentaje que se suma al total según el método de pago. */
export const PAYMENT_FEE_PERCENT: Record<PaymentMethodKey, number> = {
  wompi: 3, // tarjeta / PSE / Nequi
  addi: 6, // compra ahora, paga después
};

/**
 * Costo del medio de pago sobre la base (subtotal - descuento + envío).
 * Se redondea a la centena más cercana para que los valores queden limpios.
 */
export function paymentFeeCop(method: PaymentMethodKey, baseCop: number): number {
  const percent = PAYMENT_FEE_PERCENT[method] ?? 0;
  if (percent <= 0 || baseCop <= 0) return 0;
  return Math.round((baseCop * percent) / 100 / 100) * 100;
}
