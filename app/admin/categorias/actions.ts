"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugifyHandle } from "@/lib/slug";

const PAGE = "/admin/categorias";

// Las categorías salen en el menú, el home, el pie de página, el sitemap y
// los formularios de producto: se refresca todo junto.
function revalidateAll() {
  revalidatePath("/", "layout");
  revalidatePath(PAGE);
}

function done(message: string): never {
  revalidateAll();
  redirect(`${PAGE}?ok=${encodeURIComponent(message)}`);
}

function fail(message: string): never {
  redirect(`${PAGE}?error=${encodeURIComponent(message)}`);
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  if (!name) fail("Escribe el nombre de la categoría.");

  const slug = slugifyHandle(name);
  if (!slug) fail("Ese nombre no es válido.");
  if (slug === "todos") fail('"Todos" es un nombre reservado, elige otro.');

  const exists = await prisma.category.findFirst({
    where: { OR: [{ name: { equals: name, mode: "insensitive" } }, { slug }] },
  });
  if (exists) fail("Ya existe una categoría con ese nombre.");

  const last = await prisma.category.findFirst({ orderBy: { position: "desc" } });
  await prisma.category.create({
    data: {
      name,
      nameEn: nameEn || null,
      slug,
      position: (last?.position ?? 0) + 1,
    },
  });
  done(`Categoría "${name}" creada. Ya aparece en el menú de la tienda.`);
}

export async function updateCategory(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  if (!name) fail("El nombre no puede quedar vacío.");

  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) fail("No encontramos esa categoría.");

  if (name !== current.name) {
    const clash = await prisma.category.findFirst({
      where: { id: { not: id }, name: { equals: name, mode: "insensitive" } },
    });
    if (clash) fail("Ya existe otra categoría con ese nombre.");
  }

  // Los productos guardan el nombre de su categoría: si se renombra, se
  // actualizan juntos para que ninguno quede huérfano. El enlace (slug) no
  // cambia, así los links ya compartidos siguen funcionando.
  await prisma.$transaction([
    prisma.category.update({
      where: { id },
      data: { name, nameEn: nameEn || null },
    }),
    prisma.product.updateMany({
      where: { category: current.name },
      data: { category: name },
    }),
  ]);
  done("Categoría actualizada.");
}

export async function toggleCategoryVisibility(id: string) {
  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) fail("No encontramos esa categoría.");
  await prisma.category.update({
    where: { id },
    data: { isVisible: !current.isVisible },
  });
  done(current.isVisible ? "Categoría oculta de la tienda." : "Categoría visible en la tienda.");
}

/** Sube o baja una categoría intercambiando su posición con la vecina. */
export async function moveCategory(id: string, direction: "up" | "down") {
  const all = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });
  const index = all.findIndex((c) => c.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= all.length) {
    revalidatePath(PAGE);
    return;
  }

  // Se renumera toda la lista para evitar posiciones repetidas.
  const reordered = [...all];
  [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
  await prisma.$transaction(
    reordered.map((c, i) =>
      prisma.category.update({ where: { id: c.id }, data: { position: i + 1 } }),
    ),
  );
  revalidateAll();
}

export async function deleteCategory(id: string) {
  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) fail("No encontramos esa categoría.");

  const inUse = await prisma.product.count({ where: { category: current.name } });
  if (inUse > 0) {
    fail(
      `No se puede eliminar "${current.name}": tiene ${inUse} producto(s). Muévelos a otra categoría primero, o mejor oculta la categoría.`,
    );
  }
  await prisma.category.delete({ where: { id } });
  done(`Categoría "${current.name}" eliminada.`);
}
