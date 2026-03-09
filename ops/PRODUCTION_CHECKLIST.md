# MinimalMart Production Checklist

Use this checklist before every production go-live.

## 1. Security

- [ ] Rotate all leaked/test secrets (Stripe, Google OAuth, JWT, DB credentials).
- [ ] Store secrets in deployment secret manager (not in repo).
- [ ] Set `NODE_ENV=production`.
- [ ] Set `COOKIE_SECURE=true`.
- [ ] Set `WEB_ORIGIN` to the real domain only.
- [ ] Confirm CORS allows only approved domains.
- [ ] Confirm HTTPS is enabled at edge/load balancer.

## 2. Build And CI

- [ ] CI passes: web `lint` + `build`, api `build` + `test:e2e`.
- [ ] Pull request protection is enabled on main branch.
- [ ] Deploy only from reviewed commits/tags.

## 3. Database And Data Safety

- [ ] Production DB uses dedicated credentials and network rules.
- [ ] Automated backup is enabled (daily minimum).
- [ ] Restore drill has been tested successfully.
- [ ] Prisma migrations reviewed before deploy.
- [ ] Rollback procedure documented.

## 4. Runtime And Observability

- [ ] Health endpoints monitored (`/health/live`, `/health/ready`).
- [ ] Metrics endpoint scraped (`/metrics`).
- [ ] Alerting configured for 5xx, latency, and webhook failures.
- [ ] Request-id tracing visible in logs.

## 5. Payments/Webhooks

- [ ] Stripe production keys are configured correctly.
- [ ] Webhook endpoint is publicly reachable via HTTPS.
- [ ] Webhook signature validation works in production.
- [ ] Replay/idempotency behavior verified.

## 6. Operational Readiness

- [ ] Incident owner/on-call path is defined.
- [ ] Runbook is available and current.
- [ ] Post-deploy smoke tests documented and executed.

## 7. Release Gate

Go live only when all checklist items are complete.
