import type { Locale } from "@/lib/i18n/dictionary";

/** Nombre de la categoría en el idioma del visitante (si no hay inglés, el español). */
export function categoryLabel(
  category: { name: string; nameEn: string | null },
  locale: Locale,
): string {
  return (locale === "en" && category.nameEn) || category.name;
}
