-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "slug" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- Categorías iniciales (los productos existentes ya usan estos nombres)
INSERT INTO "categories" ("id", "name", "name_en", "slug", "position") VALUES
  (gen_random_uuid()::text, 'Vestidos',  'Dresses',   'vestidos',  1),
  (gen_random_uuid()::text, 'Enterizos', 'Jumpsuits', 'enterizos', 2),
  (gen_random_uuid()::text, 'Tops',      'Tops',      'tops',      3),
  (gen_random_uuid()::text, 'Conjuntos', 'Sets',      'conjuntos', 4);
