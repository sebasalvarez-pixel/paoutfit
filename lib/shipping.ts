// Reglas de envío en un solo lugar: las usan el servidor (para cobrar) y el
// navegador (para mostrar el resumen), así lo que se ve es lo que se cobra.
//
// La tienda está en Neiva, Huila, así que ese envío es el más barato (a
// domicilio, casi local). Al resto del país se le cobra una tarifa base, y a
// la Costa Caribe un poco más porque el flete allá es más caro.

/** Envío dentro de Neiva y municipios cercanos del Huila (el más barato). */
export const NATIONAL_SHIPPING_NEIVA_COP = 9000;

/** Tarifa base para el resto del país. */
export const NATIONAL_SHIPPING_BASE_COP = 22000;

/** Costa Caribe (Atlántico, Bolívar, La Guajira y departamentos aledaños). */
export const NATIONAL_SHIPPING_COASTAL_COP = 25000;

/** Envío nacional gratis desde este valor (después de descuentos). */
export const FREE_SHIPPING_THRESHOLD_COP = 280000;

/** Rango aproximado del envío internacional (DHL), en dólares. Se cotiza a mano. */
export const INTERNATIONAL_SHIPPING_USD_MIN = 100;
export const INTERNATIONAL_SHIPPING_USD_MAX = 160;

// Compara sin importar mayúsculas, tildes ni espacios de sobra
// ("Neiva" = "NEIVA" = "neiva ").
function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const HUILA_NAMES = new Set(["huila"]);
const NEIVA_NAMES = new Set(["neiva"]);

// Costa Caribe: Atlántico (Barranquilla), Bolívar (Cartagena), La Guajira y
// los departamentos vecinos de esa región.
const COASTAL_DEPARTMENTS = new Set(
  [
    "atlantico",
    "bolivar",
    "la guajira",
    "guajira",
    "magdalena",
    "cesar",
    "sucre",
    "cordoba",
    "san andres y providencia",
    "san andres, providencia y santa catalina",
  ].map(normalize),
);

export type ShippingZone = "neiva" | "coastal" | "national";

/** A qué zona de envío pertenece una ciudad/departamento colombianos. */
export function shippingZoneFor(city?: string | null, department?: string | null): ShippingZone {
  const c = normalize(city ?? "");
  const d = normalize(department ?? "");
  if (HUILA_NAMES.has(d) && NEIVA_NAMES.has(c)) return "neiva";
  if (COASTAL_DEPARTMENTS.has(d)) return "coastal";
  return "national";
}

export function shippingZoneCop(zone: ShippingZone): number {
  if (zone === "neiva") return NATIONAL_SHIPPING_NEIVA_COP;
  if (zone === "coastal") return NATIONAL_SHIPPING_COASTAL_COP;
  return NATIONAL_SHIPPING_BASE_COP;
}

export function nationalShippingCop(
  subtotalAfterDiscountCop: number,
  city?: string | null,
  department?: string | null,
): number {
  if (subtotalAfterDiscountCop >= FREE_SHIPPING_THRESHOLD_COP) return 0;
  return shippingZoneCop(shippingZoneFor(city, department));
}

export function amountToFreeShippingCop(subtotalAfterDiscountCop: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_COP - subtotalAfterDiscountCop);
}
