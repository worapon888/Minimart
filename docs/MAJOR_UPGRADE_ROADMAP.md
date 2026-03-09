# MinimalMart Major Upgrade Roadmap

This roadmap is for high-risk version jumps (framework/runtime/database/client SDK).

## Targets

- Node.js LTS updates
- Next.js major updates
- NestJS major updates
- Prisma major updates
- Stripe SDK major updates

## Phase 1: Inventory And Risk

1. List current and target versions for each core dependency.
2. Read official migration guides and breaking changes.
3. Classify risk:
   - High: auth, checkout, payment, DB schema/runtime
   - Medium: dashboard/admin flows
   - Low: internal tooling/dev-only

## Phase 2: Spike Branch

1. Create isolated upgrade branch.
2. Upgrade one major dependency at a time.
3. Run:
   - API build + e2e
   - Web lint + build + tests
4. Record all breakages and migration patches.

## Phase 3: Compatibility Gates

- Functional gate:
  - Auth login/refresh/logout passes
  - Checkout + webhook idempotency passes
- Performance gate:
  - No >10% latency regression in p95 under same load profile
- Security gate:
  - No new critical/high vulnerability

## Phase 4: Staging Burn-In

1. Deploy upgraded build to staging.
2. Run smoke tests and capacity scenario (`docs/CAPACITY_TEST.md`).
3. Burn-in for at least 24 hours with alerts active.

## Phase 5: Production Rollout

Follow `ops/ROLLOUT_ROLLBACK.md` exactly with canary progression and rollback triggers.

## Rollback Policy

- Keep previous release artifacts available.
- If any compatibility gate fails in production, rollback immediately.

## Done Definition

- All gates pass.
- Production rollout complete without incident.
- Migration notes documented in release record.
