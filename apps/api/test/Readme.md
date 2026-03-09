# API E2E Test Report

## Command

```bash
npm run test:e2e
```

## Precheck

- Prisma migrate deploy: success
- Database: `minimart_test` on `localhost:5432`
- Pending migrations: none

## Suite Results

- `test/checkout.e2e-spec.ts` ✅
- `test/auth-rbac.e2e-spec.ts` ✅
- `test/dashboard.e2e-spec.ts` ✅
- `test/flashsale.e2e-spec.ts` ✅
- `test/webhooks-safety.e2e-spec.ts` ✅
- `test/reservations-ttl.e2e-spec.ts` ✅
- `test/flashsale-concurrency.e2e-spec.ts` ✅

## Summary

- Test Suites: `7 passed, 7 total`
- Tests: `22 passed, 22 total`
- Snapshots: `0 total`

## Notes

- This file intentionally keeps only the clean test summary.
- Full raw terminal logs should be kept in CI artifacts if needed.
