/*
  Warnings:

  - A unique constraint covering the columns `[providerIntentId]` on the table `PaymentIntent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `PaymentIntent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `providerIntentId` to the `PaymentIntent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');

-- DropForeignKey
ALTER TABLE "PaymentIntent" DROP CONSTRAINT "PaymentIntent_orderId_fkey";

-- AlterTable
ALTER TABLE "PaymentIntent" ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
ADD COLUMN     "providerIntentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_providerIntentId_key" ON "PaymentIntent"("providerIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_idempotencyKey_key" ON "PaymentIntent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentIntent_status_idx" ON "PaymentIntent"("status");

-- CreateIndex
CREATE INDEX "PaymentIntent_provider_providerIntentId_idx" ON "PaymentIntent"("provider", "providerIntentId");

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
