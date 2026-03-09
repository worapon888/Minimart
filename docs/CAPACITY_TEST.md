# Capacity Test Playbook

Use this playbook to answer: "How many transactions per second can this system handle before degradation?"

## Prerequisites

- API running at `BASE_URL` (default `http://localhost:4000`)
- Test data exists in `products` table
- k6 installed

## Script

- `apps/api/src/loadtest/k6.checkout.capacity.js`

Modes:

- `MODE=orders`: test DB write path (`POST /checkout/orders`)
- `MODE=orders_pay`: test full path including payment intent (`POST /checkout/:orderId/pay`)

## Step Load Plan

Run each step for 5 minutes and record p95/p99 + error ratio:

1. `RATE=10`
2. `RATE=25`
3. `RATE=50`
4. `RATE=75`
5. `RATE=100`
6. Continue increasing by +25 until thresholds fail.

## Command Examples

Orders only:

```bash
k6 run -e BASE_URL=http://localhost:4000 -e MODE=orders -e RATE=50 -e DURATION=5m apps/api/src/loadtest/k6.checkout.capacity.js
```

Orders + Pay:

```bash
k6 run -e BASE_URL=http://localhost:4000 -e MODE=orders_pay -e RATE=25 -e DURATION=5m apps/api/src/loadtest/k6.checkout.capacity.js
```

## Pass/Fail Criteria

Fail the step when any condition is true:

- `checkout_orders_latency_ms p95 > 1200ms`
- `checkout_pay_latency_ms p95 > 1500ms` (for `orders_pay`)
- `checkout_orders_error > 2%`
- `checkout_pay_error > 2%` (for `orders_pay`)
- `db_lock_contention_total` increases continuously

## Capacity Number Definition

Your "safe capacity" is the highest `RATE` where all criteria still pass for a full 5-minute window.

## Notes

- `MODE=orders_pay` includes external provider latency and is usually lower.
- Use `MODE=orders` first to isolate DB bottlenecks.
- Repeat test on staging/prod-like infra for realistic numbers.
