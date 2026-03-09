# MinimalMart Rollout And Rollback Playbook

Use this playbook for every production release.

## 1) Pre-Deploy Gate (Must Pass)

- [ ] CI green on target commit (`web lint/build`, `api build/e2e`).
- [ ] `ops/PRODUCTION_CHECKLIST.md` fully checked.
- [ ] No critical/high unresolved security issue.
- [ ] DB migration reviewed and rollback path documented.
- [ ] On-call owner assigned for release window.

## 2) Release Preparation

1. Create release tag from reviewed commit.
2. Announce release window in team channel (start/end, owner, rollback owner).
3. Freeze non-release changes until validation ends.

## 3) Progressive Rollout

1. Deploy API/Web to canary pool (or 10% traffic).
2. Wait 10 minutes and monitor:
   - 5xx ratio
   - p95 latency
   - checkout success ratio
   - webhook processing error ratio
3. If healthy, increase to 50% traffic.
4. Wait 10 minutes and re-check same metrics.
5. If healthy, roll to 100%.
6. Run smoke test: `node ops/smoke-test.mjs`.

## 4) Rollback Triggers (Any One = Rollback)

- API 5xx ratio > 2% for 5 minutes.
- Checkout success ratio < 98% for 5 minutes.
- p95 API latency > 1500ms for 10 minutes.
- Data correctness bug (wrong total, wrong order state, double payment risk).

## 5) Rollback Procedure

1. Stop rollout progression immediately.
2. Re-route traffic to previous stable version.
3. Disable risky feature flags introduced in current release.
4. Validate recovery:
   - `/health/live`, `/health/ready`
   - smoke test
   - dashboard error rate returns to baseline
5. Post status update with impact window and mitigation.

## 6) DB Migration Safety Rules

- Prefer backward-compatible expand/contract migrations.
- Never deploy breaking schema + old app incompatibility in one step.
- If migration is non-reversible, define forward-fix script before rollout.

## 7) Release Exit Criteria

- Error and latency remain under thresholds for 30 minutes after 100% rollout.
- No payment/webhook regression.
- Incident log updated (even if no incidents) with release timestamp.
