/*
  Warnings:

  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('SUCCESS', 'FAIL');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "entity" TEXT,
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "status" "AuditStatus" NOT NULL DEFAULT 'SUCCESS',
ADD COLUMN     "userAgent" TEXT,
DROP COLUMN "action",
ADD COLUMN     "action" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
