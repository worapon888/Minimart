# MinimalMart API

NestJS API for MinimalMart (products, checkout, auth, dashboard, webhooks) with Prisma + PostgreSQL.

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16+

## Environment

1. Copy example files:

```bash
cp .env.example .env
cp .env.test.example .env.test
```

2. Fill required secrets:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Install

```bash
npm install
```

## Database

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

## Run

```bash
npm run dev
```

Default API URL: `http://localhost:4000`

## Test (E2E)

```bash
npm run test:e2e
```

The command uses `.env.test` and applies migrations before tests.

## Useful scripts

- `npm run build`
- `npm run start`
- `npm run start:prod`
- `npm run prisma:deploy`
- `npm run seed:dashboard-sample`
- `npm run cleanup:dashboard-sample`
