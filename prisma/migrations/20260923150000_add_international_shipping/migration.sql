-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customer_locale" TEXT NOT NULL DEFAULT 'es',
ADD COLUMN     "is_international" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shipping_quote_pending" BOOLEAN NOT NULL DEFAULT false;
