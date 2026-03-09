-- CreateEnum
CREATE TYPE "ApiAuditStatus" AS ENUM ('SUCCESS', 'FAIL');

-- CreateTable
CREATE TABLE "ApiAuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" "ApiAuditStatus" NOT NULL DEFAULT 'SUCCESS',
    "httpCode" INTEGER,
    "entity" TEXT,
    "entityId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "meta" JSONB,

    CONSTRAINT "ApiAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiAuditLog_actorId_createdAt_idx" ON "ApiAuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "ApiAuditLog_action_createdAt_idx" ON "ApiAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "ApiAuditLog_status_createdAt_idx" ON "ApiAuditLog"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ApiAuditLog_entity_entityId_idx" ON "ApiAuditLog"("entity", "entityId");
