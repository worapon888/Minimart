/*
  Warnings:

  - A unique constraint covering the columns `[requestId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "requestId" TEXT;

-- CreateIndex
CREATE INDEX "FlashSaleItem_productId_idx" ON "FlashSaleItem"("productId");

-- CreateIndex
CREATE INDEX "FlashSaleItem_startsAt_endsAt_idx" ON "FlashSaleItem"("startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_requestId_key" ON "Reservation"("requestId");
