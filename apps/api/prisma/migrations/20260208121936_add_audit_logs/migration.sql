/*
  Warnings:

  - The values [FAIL] on the enum `ApiAuditStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApiAuditStatus_new" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
ALTER TABLE "public"."ApiAuditLog" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ApiAuditLog" ALTER COLUMN "status" TYPE "ApiAuditStatus_new" USING ("status"::text::"ApiAuditStatus_new");
ALTER TYPE "ApiAuditStatus" RENAME TO "ApiAuditStatus_old";
ALTER TYPE "ApiAuditStatus_new" RENAME TO "ApiAuditStatus";
DROP TYPE "public"."ApiAuditStatus_old";
ALTER TABLE "ApiAuditLog" ALTER COLUMN "status" SET DEFAULT 'SUCCESS';
COMMIT;
