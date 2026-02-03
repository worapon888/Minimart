-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availabilityStatus" TEXT,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "minimumOrderQuantity" INTEGER,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "returnPolicy" TEXT,
ADD COLUMN     "shippingInformation" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "warrantyInformation" TEXT,
ADD COLUMN     "weight" INTEGER;

-- CreateTable
CREATE TABLE "ProductDimensions" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductDimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMeta" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "barcode" TEXT,
    "qrCode" TEXT,

    CONSTRAINT "ProductMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewerEmail" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductDimensions_productId_key" ON "ProductDimensions"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMeta_productId_key" ON "ProductMeta"("productId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- AddForeignKey
ALTER TABLE "ProductDimensions" ADD CONSTRAINT "ProductDimensions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMeta" ADD CONSTRAINT "ProductMeta_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
