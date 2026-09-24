// Las descripciones se guardan como HTML (para verse con párrafos y listas en
// la tienda), pero en el panel se editan como texto normal: quien administra
// no tiene que ver ni escribir etiquetas. Estas funciones convierten de un
// lado al otro.

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function decodeEntities(text: string) {
  return text.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENTITIES[m] ?? m);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** HTML guardado → texto plano legible (párrafos separados por una línea en blanco). */
export function htmlToText(html: string | null | undefined): string {
  if (!html) return "";
  const text = html
    .replace(/\r/g, "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|h[1-6]|ul|ol)\s*>/gi, "\n\n")
    .replace(/<\s*li[^>]*>/gi, "- ")
    .replace(/<\/\s*li\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(text)
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Texto plano del panel → HTML seguro para la tienda.
 * - Una línea en blanco separa párrafos.
 * - Las líneas que empiezan con "- " forman una lista con viñetas.
 */
export function textToHtml(text: string | null | undefined): string {
  const clean = (text ?? "").replace(/\r/g, "").trim();
  if (!clean) return "";

  return clean
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0 && lines.every((l) => /^[-•*]\s+/.test(l))) {
        const items = lines
          .map((l) => `<li>${escapeHtml(l.replace(/^[-•*]\s+/, ""))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${lines.map(escapeHtml).join("<br>")}</p>`;
    })
    .join("");
}

/**
 * Para mostrar en la tienda: si la descripción ya trae etiquetas se usa tal
 * cual; si es texto suelto (sin etiquetas), se le da formato de párrafos.
 */
export function descriptionToDisplayHtml(value: string | null | undefined): string {
  if (!value) return "";
  return /<\/?[a-z][\s\S]*>/i.test(value) ? value : textToHtml(value);
}
