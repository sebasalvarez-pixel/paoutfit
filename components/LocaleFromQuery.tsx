"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { Locale } from "@/lib/i18n/dictionary";

// Los links que mandamos por correo traen ?lang=en|es para abrir la página
// en el idioma del cliente aunque en este dispositivo no haya elegido uno.
export function LocaleFromQuery({ lang }: { lang: Locale | null }) {
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    if (lang && lang !== locale) setLocale(lang);
    // Solo al abrir la página: si después el cliente cambia el idioma a mano, se respeta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
