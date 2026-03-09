import { Counter, Histogram, register } from "prom-client";

const registry = register;

function getOrCreateCounter(
  name: string,
  help: string,
  labelNames: readonly string[],
) {
  const existing = registry.getSingleMetric(name);
  if (existing) return existing as Counter<string>;
  return new Counter({
    name,
    help,
    labelNames,
  });
}

function getOrCreateHistogram(
  name: string,
  help: string,
  labelNames: readonly string[],
  buckets: number[],
) {
  const existing = registry.getSingleMetric(name);
  if (existing) return existing as Histogram<string>;
  return new Histogram({
    name,
    help,
    labelNames,
    buckets,
  });
}

export const dbQueryDurationMs = getOrCreateHistogram(
  "db_query_duration_ms",
  "Prisma query duration in ms",
  ["model", "action", "status"] as const,
  [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
);

export const dbLockContentionTotal = getOrCreateCounter(
  "db_lock_contention_total",
  "Total DB lock/contention related query errors",
  ["model", "action"] as const,
);

export const checkoutPayDurationMs = getOrCreateHistogram(
  "checkout_pay_duration_ms",
  "Checkout pay endpoint duration in ms",
  ["status"] as const,
  [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
);

export const checkoutPayTotal = getOrCreateCounter(
  "checkout_pay_total",
  "Total checkout pay requests",
  ["status"] as const,
);

export function isLockContentionError(err: unknown): boolean {
  const e = err as { code?: string; message?: string };
  const code = String(e?.code ?? "");
  const msg = String(e?.message ?? "").toLowerCase();

  // Prisma + Postgres contention patterns.
  if (code === "P2034") return true;
  if (code === "40P01" || code === "55P03") return true;

  return (
    msg.includes("deadlock detected") ||
    msg.includes("could not obtain lock") ||
    msg.includes("lock timeout")
  );
}
