# MinimalMart Core Flows

## Auth Token Rotation

1. User logs in via `POST /auth/login`.
2. API returns short-lived access token in JSON response.
3. API sets refresh token in HTTP-only cookie at path `/auth/refresh`.
4. Client refreshes via `POST /auth/refresh`.
5. API verifies refresh token, rotates token, and writes a new refresh cookie.
6. Old refresh token is revoked and cannot be reused.

Security notes:
- Refresh cookie uses `httpOnly`, `sameSite=lax`, and `secure=true` in production.
- `COOKIE_SECURE` must be true in production runtime.
- Refresh tokens are stored as hash in DB (`RefreshToken.tokenHash`).

## Checkout + Payment + Webhook Idempotency

### Direct checkout flow

1. Client calls `POST /checkout/orders` with:
   - `items[]`
   - `shipping`
   - `idempotencyKey`
2. API creates order in `PENDING` state.
3. Client calls `POST /checkout/:orderId/pay` with idempotency key.
4. API creates Stripe payment intent and returns `clientSecret`.
5. Stripe webhook confirms payment and API marks order as paid.

### Idempotency guarantees

- `POST /checkout/orders` uses scope `checkout.orders`.
- `POST /checkout/:orderId/pay` uses scope `checkout.pay`.
- Duplicate requests with same key must return the original response.
- Webhook events are de-duplicated by provider + event id.

## Operational invariants

- No secret values are committed to repository.
- Production must define `WEB_ORIGIN`, `JWT_*`, and Stripe secrets.
- CORS only allows configured frontend origin in production.

## Bottleneck Metrics (Prometheus)

Track these metrics to find real bottlenecks:

- `db_query_duration_ms{model,action,status}`
  - Prisma query latency by model/action.
- `db_lock_contention_total{model,action}`
  - Increments on lock/deadlock contention patterns.
- `checkout_pay_duration_ms{status}`
  - End-to-end latency for `POST /checkout/:orderId/pay`.
- `checkout_pay_total{status}`
  - Success/error counts for checkout pay requests.

Suggested alerts:

- checkout pay `p95` > 1500ms for 5 minutes.
- checkout pay error ratio > 2% for 5 minutes.
- lock contention counter increasing continuously.
