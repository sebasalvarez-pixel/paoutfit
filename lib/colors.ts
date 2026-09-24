// Códigos de color (hex) de los nombres de color más comunes, para dibujar
// los círculos de color en los filtros sin pedirle a nadie que los escriba.
// Si un color no está en la lista, se usa un gris neutro.
const COLOR_HEX: Record<string, string> = {
  negro: "#1f1b1c",
  blanco: "#ffffff",
  gris: "#9a9a9a",
  "gris claro": "#d0d0d0",
  "gris oscuro": "#5a5a5a",
  rosa: "#f4a7b9",
  rosado: "#f4a7b9",
  "rosa barbie": "#e0559b",
  rojo: "#d1242f",
  vinotinto: "#722f37",
  cereza: "#9b1b30",
  coral: "#ff7f6e",
  naranja: "#f28c28",
  amarillo: "#f5d547",
  verde: "#3f9b5a",
  "verde menta": "#a8e0c5",
  "verde militar": "#5b6b3a",
  azul: "#2f5fb3",
  "azul oscuro": "#1b2a52",
  celeste: "#9ed3f0",
  morado: "#7a4fb5",
  lila: "#c8a7e6",
  beige: "#e6d5b8",
  nude: "#e2bfa3",
  café: "#6b4530",
  "café claro": "#b48a68",
  cafe: "#6b4530",
  "cafe claro": "#b48a68",
  dorado: "#c9a24a",
  plateado: "#c0c0c0",
};

export function colorHexFor(name: string, savedHex?: string | null): string {
  if (savedHex) return savedHex;
  return COLOR_HEX[name.trim().toLowerCase()] ?? "#dddddd";
}
