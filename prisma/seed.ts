import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "../app/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// El proyecto viejo de Shopify (PAOFIT) vive al lado de este (paofit-web).
// De ahí reutilizamos el CSV de productos y las fotos ya organizadas.
const OLD_PROJECT_DIR = path.resolve(__dirname, "../../PAOFIT");
const CSV_PATH = path.join(
  OLD_PROJECT_DIR,
  "brand-assets/paoutfit-productos-shopify.csv",
);
const PHOTOS_DIR = path.join(
  OLD_PROJECT_DIR,
  "brand-assets/product-photos-organized",
);
const PUBLIC_PRODUCTS_DIR = path.resolve(__dirname, "../public/products");

type CsvRow = {
  Handle: string;
  Title: string;
  "Body (HTML)": string;
  Type: string;
  "Option1 Value": string;
  "Variant SKU": string;
  "Variant Inventory Qty": string;
  "Variant Price": string;
};

function normalizeColor(value: string): string {
  return value.trim().toLowerCase();
}

async function seedProductsAndVariants() {
  const csvContent = fs.readFileSync(CSV_PATH, "utf-8");
  const rows: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const rowsByHandle = new Map<string, CsvRow[]>();
  for (const row of rows) {
    const list = rowsByHandle.get(row.Handle) ?? [];
    list.push(row);
    rowsByHandle.set(row.Handle, list);
  }

  for (const [handle, variantRows] of rowsByHandle) {
    const first = variantRows[0];

    const product = await prisma.product.upsert({
      where: { handle },
      update: {
        title: first.Title,
        descriptionHtml: first["Body (HTML)"],
        category: first.Type,
      },
      create: {
        handle,
        title: first.Title,
        descriptionHtml: first["Body (HTML)"],
        category: first.Type,
        basePriceCop: parseInt(first["Variant Price"], 10),
      },
    });

    for (const row of variantRows) {
      await prisma.productVariant.upsert({
        where: { sku: row["Variant SKU"] },
        update: {
          colorName: row["Option1 Value"],
          priceCop: parseInt(row["Variant Price"], 10),
          inventoryQty: parseInt(row["Variant Inventory Qty"], 10),
        },
        create: {
          productId: product.id,
          colorName: row["Option1 Value"],
          sku: row["Variant SKU"],
          priceCop: parseInt(row["Variant Price"], 10),
          inventoryQty: parseInt(row["Variant Inventory Qty"], 10),
        },
      });
    }

    console.log(`Producto: ${handle} (${variantRows.length} variantes)`);
  }
}

async function seedPhotos() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.warn("No se encontró la carpeta de fotos organizadas, se omite.");
    return;
  }

  const productHandles = fs.readdirSync(PHOTOS_DIR).filter((entry) =>
    fs.statSync(path.join(PHOTOS_DIR, entry)).isDirectory(),
  );

  for (const handle of productHandles) {
    const product = await prisma.product.findUnique({
      where: { handle },
      include: { variants: true },
    });
    if (!product) {
      console.warn(`Producto "${handle}" no existe en la base, se omite.`);
      continue;
    }

    const sourceDir = path.join(PHOTOS_DIR, handle);
    const destDir = path.join(PUBLIC_PRODUCTS_DIR, handle);
    fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith(".jpg"));

    for (const [index, filename] of files.entries()) {
      // patrón: <handle>-<color>-<frente|espalda>[-2].jpg
      const withoutExt = filename.replace(/\.jpg$/, "");
      const rest = withoutExt.slice(handle.length + 1); // quita "<handle>-"
      const match = rest.match(/^(.+)-(frente|espalda)(?:-\d+)?$/);
      if (!match) {
        console.warn(`No se pudo interpretar el nombre: ${filename}`);
        continue;
      }
      const [, colorSlug, angle] = match;

      const variant = product.variants.find(
        (v) => normalizeColor(v.colorName) === colorSlug,
      );
      if (!variant) {
        console.warn(
          `Color "${colorSlug}" de ${filename} no coincide con ninguna variante de ${handle}`,
        );
        continue;
      }

      fs.copyFileSync(
        path.join(sourceDir, filename),
        path.join(destDir, filename),
      );
      const storagePath = `/products/${handle}/${filename}`;

      await prisma.productImage.upsert({
        where: { id: `${variant.id}-${angle}-${index}` },
        update: {},
        create: {
          id: `${variant.id}-${angle}-${index}`,
          productId: product.id,
          variantId: variant.id,
          storagePath,
          angle,
          position: index,
          altText: `${product.title} color ${variant.colorName}`,
        },
      });
    }
    console.log(`Fotos copiadas para: ${handle}`);
  }
}

async function seedDiscountCode() {
  await prisma.discountCode.upsert({
    where: { code: "BIENVENIDA5" },
    update: {},
    create: {
      code: "BIENVENIDA5",
      type: "percentage",
      value: 5,
      isActive: true,
    },
  });
  console.log("Código de descuento BIENVENIDA5 listo.");
}

async function main() {
  await seedProductsAndVariants();
  await seedPhotos();
  await seedDiscountCode();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
