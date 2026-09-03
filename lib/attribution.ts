import { cookies } from "next/headers";

const EMPTY_ATTRIBUTION = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  referrer: null,
  landingPath: null,
} as const;

export async function readAttribution() {
  try {
    const store = await cookies();
    return {
      utmSource: store.get("paoutfit_utm_source")?.value || null,
      utmMedium: store.get("paoutfit_utm_medium")?.value || null,
      utmCampaign: store.get("paoutfit_utm_campaign")?.value || null,
      referrer: store.get("paoutfit_referrer")?.value || null,
      landingPath: store.get("paoutfit_landing_path")?.value || null,
    };
  } catch {
    // Fuera de una petición real de Next (scripts, pruebas) no hay cookies.
    return EMPTY_ATTRIBUTION;
  }
}
