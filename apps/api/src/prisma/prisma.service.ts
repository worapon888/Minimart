import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  dbLockContentionTotal,
  dbQueryDurationMs,
  isLockContentionError,
} from "../metrics/perf-metrics";

function sqlAction(query: string): string {
  const first = String(query || "")
    .trim()
    .split(/\s+/)[0]
    ?.toUpperCase();
  if (!first) return "UNKNOWN";
  return first;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is missing. Check apps/api/.env");
    }

    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        "warn",
      ],
    });

    this.pool = pool;

    (this as any).$on("query", (event: any) => {
      dbQueryDurationMs.observe(
        {
          model: "sql",
          action: sqlAction(event?.query),
          status: "ok",
        },
        Number(event?.duration ?? 0),
      );
    });

    (this as any).$on("error", (event: any) => {
      const message = String(event?.message ?? "");
      if (isLockContentionError({ message })) {
        dbLockContentionTotal.inc({ model: "unknown", action: "unknown" });
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
