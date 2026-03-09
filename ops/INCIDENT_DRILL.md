# MinimalMart Incident Drill Guide

Run this drill at least once per quarter.

## Drill Scope

Simulate and verify team response for:

1. API 5xx spike
2. Stripe webhook failure
3. DB migration failure

## Roles

- Incident Commander (IC): owns timeline and decisions.
- Ops Driver: executes rollback/fix actions.
- Scribe: records timeline, metrics, and final report.

## Drill Steps

1. Pick one scenario and define start time.
2. Trigger controlled fault in staging (not production).
3. Start timer when alert fires.
4. Team executes runbook (`ops/RUNBOOK.md`).
5. End timer when service is healthy and smoke test passes.
6. Hold 20-minute retro and capture action items.

## Acceptance Criteria

- Time to detect (TTD) <= 5 minutes.
- Time to mitigate (TTM) <= 15 minutes for rollback scenario.
- Correct escalation path used within 3 minutes after detection.
- Customer-impact statement posted in status channel.
- Post-incident report published within 24 hours.

## Drill Report Template

- Date/time:
- Scenario:
- Participants:
- TTD:
- TTM:
- What worked:
- What failed:
- Follow-up actions (owner + due date):

## Follow-Up Rule

Any failed acceptance criterion must produce a tracked action item and an owner.
