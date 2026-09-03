"use client";

import { useEffect } from "react";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function setCookieIfMissing(name: string, value: string) {
  if (!value) return;
  const alreadySet = document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${name}=`));
  if (alreadySet) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}`;
}

/**
 * Guarda de dónde vino el visitante (UTM, referrer, página de entrada) la
 * primera vez que llega — así el panel de administración puede mostrar
 * "de dónde vienen las ventas" más adelante (fase 3).
 */
export function AttributionCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCookieIfMissing("paoutfit_utm_source", params.get("utm_source") ?? "");
    setCookieIfMissing("paoutfit_utm_medium", params.get("utm_medium") ?? "");
    setCookieIfMissing(
      "paoutfit_utm_campaign",
      params.get("utm_campaign") ?? "",
    );
    setCookieIfMissing("paoutfit_referrer", document.referrer ?? "");
    setCookieIfMissing(
      "paoutfit_landing_path",
      window.location.pathname ?? "",
    );
  }, []);

  return null;
}
