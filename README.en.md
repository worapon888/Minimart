# MinimalMart Monorepo

MinimalMart is an e-commerce project organized as a monorepo with 2 apps:
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

Set up at least these files:

- `apps/web/.env.local`
- `apps/api/.env`
- `apps/api/.env.test` (used by e2e tests)

Notes:
- Do not use production secrets in local/test files.
- `apps/api/.env.test` must include required values (for example: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`).

## Install Dependencies

Install dependencies per app:

```bash
cd apps/api
npm install

cd ../web
npm install
```

## Run with Docker (Recommended)

Start core services from the repo root:

```bash
docker compose up -d db redis
```

Verify containers are running:

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

Current automated tests are in `apps/api` (E2E):

```bash
cd apps/api
npm run test:e2e
```

If you hit a missing test database issue (`minimart_test`), create it first:

```bash
docker exec minimart_db createdb -U minimart minimart_test
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

- `apps/web` currently has no test script in `package.json` (it includes `lint`/`build`/`start`).
- API e2e suites cover auth, checkout, flash sale, dashboard, and webhook safety.

