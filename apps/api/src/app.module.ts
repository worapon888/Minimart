import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { seconds, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import * as fs from "node:fs";
import * as path from "node:path";

import { PrometheusModule } from "@willsoto/nestjs-prometheus";

import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AuditModule } from "./modules/audit/audit.module";
import { CheckoutModule } from "./modules/checkout/checkout.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { HealthModule } from "./modules/health/health.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { ProductsModule } from "./modules/products/products.module";
import { ReservationsModule } from "./modules/reservations/reservations.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuditInterceptor } from "./common/audit/audit.interceptor";
import { ThrottlerClientGuard } from "./common/throttle/throttler-client.guard";

// Environment resolution (ConfigModule is the source of truth)
function pickEnvFilePath(): string | undefined {
  const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
  const isTest = nodeEnv === "test";

  const candidates = isTest
    ? [
        path.join(process.cwd(), ".env.test"),
        path.resolve(process.cwd(), "apps", "api", ".env.test"),
        path.resolve(__dirname, "..", ".env.test"),
        // Fallback to regular env if .env.test is not available.
        path.join(process.cwd(), ".env"),
        path.resolve(process.cwd(), "apps", "api", ".env"),
        path.resolve(__dirname, "..", ".env"),
      ]
    : [
        path.join(process.cwd(), ".env.local"),
        path.join(process.cwd(), ".env"),
        path.resolve(process.cwd(), "apps", "api", ".env.local"),
        path.resolve(process.cwd(), "apps", "api", ".env"),
        path.resolve(__dirname, "..", ".env.local"),
        path.resolve(__dirname, "..", ".env"),
      ];

  return candidates.find((p) => fs.existsSync(p));
}

const envFilePath = pickEnvFilePath();

function toPositiveInt(v: unknown, fallback: number) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.trunc(n);
}

// Cache TTL env: prefer milliseconds, fallback to seconds.
function cacheTtlSecondsFromEnv(config: ConfigService) {
  const ms = config.get("CACHE_TTL_MS");
  if (ms !== undefined && ms !== null && String(ms).trim() !== "") {
    const msNum = toPositiveInt(ms, 30_000);
    return Math.max(1, Math.ceil(msNum / 1000));
  }
  const sec = config.get("CACHE_TTL_SECONDS");
  return toPositiveInt(sec, 30);
}

// Throttle env (seconds): THROTTLE_TTL_SECONDS / THROTTLE_LIMIT.
function throttleFromEnv(config: ConfigService) {
  const ttlSeconds = toPositiveInt(config.get("THROTTLE_TTL_SECONDS"), 60);
  const limit = toPositiveInt(config.get("THROTTLE_LIMIT"), 200);
  return { ttlSeconds, limit };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      cache: true,
      expandVariables: true,
      ignoreEnvFile: process.env.IGNORE_ENV_FILE === "true",
    }),

    // Metrics endpoint: GET /metrics.
    PrometheusModule.register({
      path: "/metrics",
      defaultMetrics: { enabled: true },
    }),

    // Global rate-limit; route-level overrides still possible via @Throttle.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const { ttlSeconds, limit } = throttleFromEnv(config);
        return {
          throttlers: [{ ttl: seconds(ttlSeconds), limit }],
        };
      },
    }),

    ScheduleModule.forRoot(),

    // Application cache (separate concern from throttling).
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ttl = cacheTtlSecondsFromEnv(config);
        const max = toPositiveInt(config.get("CACHE_MAX"), 200);
        return { ttl, max };
      },
    }),

    PrismaModule,

    // API-level audit logging.
    AuditModule,

    ProductsModule,
    InventoryModule,
    ReservationsModule,
    CheckoutModule,
    WebhooksModule,
    DashboardModule,
    AuthModule,
    AdminModule,
    HealthModule,
  ],
  providers: [
    // Rate-limit keying by user/client instead of IP.
    { provide: APP_GUARD, useClass: ThrottlerClientGuard },

    // Log only endpoints decorated with @Audit().
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
