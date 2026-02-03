import { defineConfig } from "prisma/config";
import dotenv from "dotenv";
import path from "path";

// โหลด .env จาก apps/api/.env ให้ชัวร์
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

export default defineConfig({
  // ✅ schema อยู่ที่ apps/api/prisma/schema.prisma
  schema: "./prisma/schema.prisma",

  // ✅ Prisma v7 ต้องใส่ datasource.url ใน config (ไม่ใส่ใน schema.prisma แล้ว)
  datasource: {
    url: process.env.DATABASE_URL,
  },

  // (optional) ถ้ามึงใช้ seed แบบเดิม
  migrations: {
    seed: "node -r ts-node/register/transpile-only prisma/seed.ts",
  },
});
