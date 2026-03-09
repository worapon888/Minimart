# MinimalMart Runbook

## Smoke Test After Deploy

1. Run automated smoke test:
   - `node ops/smoke-test.mjs`
   - optional: `API_BASE_URL=https://api.example.com WEB_BASE_URL=https://example.com node ops/smoke-test.mjs`
2. Login flow:
   - register/login returns access token
   - refresh cookie is set
3. Checkout flow:
   - create order
   - payment intent created
4. Webhook flow:
   - webhook accepted and signature verified
   - order state changes once (idempotent)

## Incident: API 5xx Spike

1. Check latest deploy and rollback if needed.
2. Inspect API logs with `requestId`.
3. Verify DB availability and connection count.
4. Verify Stripe/webhook status if failures are payment-related.

## Incident: Webhook Failures

1. Confirm endpoint reachability from Stripe dashboard.
2. Confirm `STRIPE_WEBHOOK_SECRET` matches current endpoint.
3. Inspect signature validation errors in logs.
4. Replay a failed event after fix.

## Incident: DB Migration Failure

1. Stop rolling deploy progression.
2. Assess migration error details.
3. Apply rollback plan or hotfix migration.
4. Re-run readiness checks before traffic restore.
