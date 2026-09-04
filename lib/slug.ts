export function slugify(text: string) {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function slugifyHandle(text: string) {
  return slugify(text).toLowerCase();
}
