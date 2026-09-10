import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "./dictionary";

// Para Server Components: lee el idioma elegido desde la cookie (por
// defecto español). El botón de idioma en el header cambia esta cookie.
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "es";
}
