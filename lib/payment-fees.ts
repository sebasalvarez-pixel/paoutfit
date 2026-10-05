// Costo del medio de pago, en un solo lugar (igual que lib/shipping.ts): lo usa
// el servidor para cobrar y el navegador para mostrarlo antes de pagar.
//
// Idea: lo que cobra la plataforma de pago se le suma al cliente, de forma que
// a la tienda le llegue EXACTAMENTE lo que valen sus productos + envío, sin
// que la comisión se coma la utilidad. Como la plataforma cobra su comisión
// sobre el total que paga el cliente (que ya incluye el recargo), el cálculo
// "despeja" el total así:
//
//     neto = total - (porcentaje × total + fijo) × (1 + IVA)
//     total = (base + fijo × (1 + IVA)) / (1 - porcentaje × (1 + IVA))
//
// Para quitar el recargo de un método, basta poner percent y fixedCop en 0.

export type PaymentMethodKey = "wompi" | "addi";

export const PAYMENT_FEE_CONFIG: Record<
  PaymentMethodKey,
  {
    /** Porcentaje que cobra la plataforma sobre cada venta. */
    percent: number;
    /** Valor fijo por transacción, en pesos. */
    fixedCop: number;
    /** IVA que la plataforma cobra sobre su comisión (0 si no aplica). */
    ivaPercent: number;
    /** De dónde sale la tarifa, para no olvidarlo. */
    source: string;
  }
> = {
  // Plan Avanzado de Wompi: https://wompi.com/es/co/planes-tarifas/
  wompi: {
    percent: 2.65,
    fixedCop: 700,
    ivaPercent: 19,
    source: "Tarifa oficial publicada por Wompi (2,65 % + $700 + IVA).",
  },
  // Addi no publica su tarifa: es la de nuestro contrato. En el panel de aliados
  // de Addi (Ecommerce) figura "Tarifa de intermediación 6,50 %", con pago a 30
  // días de cada venta. El panel no dice si suma IVA; si lo cobra aparte,
  // poner ivaPercent en 19.
  addi: {
    percent: 6.5,
    fixedCop: 0,
    ivaPercent: 0,
    source: "Panel de aliados de Addi: tarifa de intermediación 6,50 % (Ecommerce).",
  },
};

/**
 * Costo del medio de pago sobre la base (subtotal - descuento + envío).
 * Se redondea hacia arriba a la centena para que los valores queden limpios y
 * nunca se quede corto.
 */
export function paymentFeeCop(method: PaymentMethodKey, baseCop: number): number {
  const cfg = PAYMENT_FEE_CONFIG[method];
  if (!cfg || baseCop <= 0 || (cfg.percent <= 0 && cfg.fixedCop <= 0)) return 0;

  const iva = 1 + cfg.ivaPercent / 100;
  const total = (baseCop + cfg.fixedCop * iva) / (1 - (cfg.percent / 100) * iva);
  return Math.ceil((total - baseCop) / 100) * 100;
}

/** Lo que la plataforma le descuenta a la tienda de un cobro de `totalCop`. */
export function platformCostCop(method: PaymentMethodKey, totalCop: number): number {
  const cfg = PAYMENT_FEE_CONFIG[method];
  const iva = 1 + cfg.ivaPercent / 100;
  return Math.round(((cfg.percent / 100) * totalCop + cfg.fixedCop) * iva);
}
