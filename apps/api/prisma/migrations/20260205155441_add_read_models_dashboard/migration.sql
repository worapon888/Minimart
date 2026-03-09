-- CreateEnum
CREATE TYPE "TopWindow" AS ENUM ('D7', 'D30');

-- DropIndex
DROP INDEX "OrderItem_orderId_idx";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DailySales" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "grossCents" INTEGER NOT NULL DEFAULT 0,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "itemsSold" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopProduct" (
    "id" TEXT NOT NULL,
    "window" "TopWindow" NOT NULL,
    "asOfDate" DATE NOT NULL,
    "productId" TEXT NOT NULL,
    "qtySold" INTEGER NOT NULL DEFAULT 0,
    "revenueCents" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailySales_date_idx" ON "DailySales"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySales_date_key" ON "DailySales"("date");

-- CreateIndex
CREATE INDEX "TopProduct_window_asOfDate_rank_idx" ON "TopProduct"("window", "asOfDate", "rank");

-- CreateIndex
CREATE INDEX "TopProduct_productId_idx" ON "TopProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "TopProduct_window_asOfDate_productId_key" ON "TopProduct"("window", "asOfDate", "productId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_status_paidAt_idx" ON "Order"("status", "paidAt");

-- CreateIndex
CREATE INDEX "Order_paidAt_idx" ON "Order"("paidAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_productId_idx" ON "OrderItem"("orderId", "productId");

-- AddForeignKey
ALTER TABLE "TopProduct" ADD CONSTRAINT "TopProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
