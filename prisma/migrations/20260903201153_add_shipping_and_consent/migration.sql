-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "carrier" TEXT DEFAULT 'ENVIA',
ADD COLUMN     "data_policy_accepted_at" TIMESTAMP(3),
ADD COLUMN     "fulfilled_at" TIMESTAMP(3),
ADD COLUMN     "tracking_number" TEXT;
