# MinimalMart Monorepo

MinimalMart เป็นโปรเจกต์ e-commerce แบบแยกเป็น 2 แอปใน monorepo:
- `apps/web`: Next.js storefront + dashboard UI
- `apps/api`: NestJS API + Prisma + PostgreSQL

## Project Structure

```text
Minimart/
  apps/
    web/   # Next.js 15
    api/   # NestJS + Prisma
  docker-compose.yml
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop

## Environment Files

ตั้งค่า env อย่างน้อยตามนี้:

- `.env` (root, ใช้กับ docker compose)
- `apps/web/.env.local`
- `apps/api/.env`
- `apps/api/.env.test` (ใช้สำหรับ e2e tests)

หมายเหตุ:
- ห้ามใช้ production secrets ในไฟล์ local/test
- `apps/api/.env.test` ต้องมีค่าที่จำเป็นครบ (เช่น `JWT_SECRET`, `JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`)

เริ่มต้นได้เร็วด้วยไฟล์ตัวอย่าง:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/api/.env.test.example apps/api/.env.test
cp apps/web/.env.local.example apps/web/.env.local
```

## Install Dependencies

ติดตั้งแยกแต่ละแอป:

```bash
cd apps/api
npm install

cd ../web
npm install
```

## Run with Docker (Recommended)

รัน services หลักจาก root:

```bash
docker compose up -d db redis
```

ตรวจสอบว่า container ขึ้นครบ:

```bash
docker ps
```

## Run API (Local)

```bash
cd apps/api
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

API default: `http://localhost:4000`

## Run Web (Local)

```bash
cd apps/web
npm run dev
```

Web default: `http://localhost:3000`

## Testing

ตอนนี้ชุดเทสต์หลักอยู่ที่ `apps/api` (E2E)

```bash
cd apps/api
npm run test:e2e
```

หากเจอปัญหาเกี่ยวกับฐานข้อมูลทดสอบ (`minimart_test`) ให้สร้าง DB ก่อน:

```bash
docker exec minimart_db createdb -U minimart minimart_test
```

Web tests (Vitest):

```bash
cd apps/web
npm run test:run
npm run test:coverage
```

## Useful Commands

```bash
# API
cd apps/api
npm run build
npm run start

# Web
cd apps/web
npm run build
npm run start
```

## Notes

- ชุด e2e ของ API ครอบคลุม auth, checkout, flash sale, dashboard, webhook safety
- มี GitHub Actions workflow ที่ `.github/workflows/ci.yml` สำหรับ `web lint/build` และ `api build/e2e`
- มี secret scanning workflow ที่ `.github/workflows/secret-scan.yml`
- มี smoke test หลัง deploy ที่ `ops/smoke-test.mjs`
- มี flow docs สำหรับ auth/checkout/webhook ที่ `docs/ARCHITECTURE_FLOWS.md`
- มี capacity test playbook ที่ `docs/CAPACITY_TEST.md`
- มี rollout/rollback playbook ที่ `ops/ROLLOUT_ROLLBACK.md`
- มี incident drill guide ที่ `ops/INCIDENT_DRILL.md`
- มี major upgrade roadmap ที่ `docs/MAJOR_UPGRADE_ROADMAP.md`
