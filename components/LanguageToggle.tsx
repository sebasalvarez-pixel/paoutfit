"use client";

import { useLocale } from "@/components/LocaleProvider";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center text-xs tracking-wide text-ink/60">
      <button
        type="button"
        onClick={() => setLocale("es")}
        className={`px-1 ${locale === "es" ? "text-rose font-medium" : "hover:text-ink"}`}
      >
        ES
      </button>
      <span className="text-ink/30">/</span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-1 ${locale === "en" ? "text-rose font-medium" : "hover:text-ink"}`}
      >
        EN
      </button>
    </div>
  );
}
