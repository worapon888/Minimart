MinimalMart

MinimalMart is a production-oriented e-commerce system built to explore real-world backend architecture challenges beyond a simple storefront demo.

Instead of focusing only on UI, this project focuses on solving common production problems such as:

payment retries

flash sale race conditions

webhook duplication

dashboard analytics performance

observability and system reliability

The project is implemented as a monorepo with a clear separation between frontend and backend services.

Architecture Overview

MinimalMart follows a frontend / backend separation architecture.

Client
   │
   ▼
Next.js Web (apps/web)
   │
   ▼
NestJS API (apps/api)
   │
   ▼
PostgreSQL (source of truth)
Redis (cache / reservation support)
Stripe (payment provider)

Observability
Prometheus + Grafana

The backend is organized using modular domain architecture.

Main modules

auth

products

inventory

checkout

reservations

payments

webhooks

dashboard

Cross-cutting concerns

validation

throttling

audit logging

metrics

exception filters

Key Features
Authentication & Security

JWT authentication

refresh token rotation

refresh token reuse detection

Payments

Stripe integration

idempotent checkout and payment operations

Flash Sale Protection

reservation-based stock system

TTL jobs for releasing expired reservations

stock commit only after successful payment

Analytics

dashboard read models (DailySales, TopProduct)

optimized queries for reporting

Reliability

webhook deduplication

audit logging

metrics instrumentation

Observability

Prometheus metrics

Grafana dashboards

request tracing

Testing

API E2E tests

frontend unit tests

Tech Stack
Frontend

Next.js 15

React 19

TypeScript

NextAuth

Tailwind CSS 4

Radix UI

GSAP

Framer Motion

Lenis

Vitest

Backend

NestJS 10

Prisma ORM

PostgreSQL

Redis

Stripe

Infrastructure / DevOps

Docker Compose

Prometheus

Grafana

OpenTelemetry

GitHub Actions

Shared

npm workspaces

shared types / utilities

Engineering Challenges Addressed
Payment Idempotency

Network retries or double-click events can cause duplicate orders.

The system protects checkout and payment flows using an IdempotencyKey system that ensures operations such as:

checkout.orders

checkout.pay

are executed only once.

Webhook Deduplication

Stripe webhooks may retry events multiple times.

Webhook events are stored with a unique constraint:

(provider, eventId)

This guarantees each event is processed only once.

Flash Sale Oversell Prevention

High concurrency during flash sales can cause stock inconsistencies.

The system uses:

reservation records

stock validation

reservation expiration jobs

payment-confirmed stock commit

to prevent overselling.

Dashboard Query Optimization

Analytics queries can become expensive as order data grows.

Instead of aggregating directly from orders on every request, the system maintains read models such as:

DailySales

TopProduct

This keeps dashboard queries efficient.

Performance Considerations

The system includes several mechanisms to help handle load:

product list caching

read models for analytics

request throttling

metrics instrumentation

However, actual capacity must be measured with load testing.

A k6 load testing playbook is included in the repository.

Example performance thresholds

checkout_orders p95 > 1200ms

checkout_pay p95 > 1500ms

error ratio > 2%

Potential bottlenecks

checkout / payment flows (DB + Stripe latency)

flash sale reservation contention

dashboard analytics queries

Known Limitations

Some improvements are intentionally left open for future development.

Shipping persistence

Shipping information in the checkout flow is not fully persisted yet.

NextAuth token refresh

Automatic access token refresh logic is incomplete.

Flash sale stock invariants

Additional safeguards could be added to strengthen stock consistency.

Project Structure
MinimalMart/
  apps/
    web/        # Next.js storefront + dashboard
    api/        # NestJS API + Prisma
  packages/
    shared/     # shared types / utilities
  docker-compose.yml
Getting Started
Prerequisites

Node.js 20+

npm 10+

Docker Desktop

Environment Setup

Required environment files:

.env (root, for docker compose)

apps/web/.env.local

apps/api/.env

apps/api/.env.test
Example setup
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/api/.env.test.example apps/api/.env.test
cp apps/web/.env.local.example apps/web/.env.local

⚠️ Never use production secrets in local/test files.

Install Dependencies

Install dependencies separately for each app.

cd apps/api
npm install

cd ../web
npm install
Run Infrastructure (Docker)

Start core services:

docker compose up -d db redis

Check containers:

docker ps
Run API
cd apps/api

npm run prisma:generate
npm run prisma:migrate
npm run dev

API runs on:

http://localhost:4000
Run Web
cd apps/web
npm run dev

Web runs on:

http://localhost:3000
Testing
API E2E Tests
cd apps/api
npm run test:e2e

If the test database does not exist:

docker exec minimart_db createdb -U minimart minimart_test
Web Tests
cd apps/web
npm run test:run
npm run test:coverage
CI & Operations

The repository includes several operational workflows.

CI pipelines
.github/workflows/ci.yml
Secret scanning
.github/workflows/secret-scan.yml
Operational tooling

smoke tests after deploy

capacity testing playbook

rollout / rollback guides

incident drill documentation

Purpose of the Project

MinimalMart was built as a learning project to explore production-level backend architecture, including:

reliability

concurrency handling

observability

operational readiness

The goal is to understand how real-world systems handle problems such as retries, race conditions, and monitoring under load.
