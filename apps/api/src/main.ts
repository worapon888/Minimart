// Bootstrap prerequisites
import "reflect-metadata";

import { startTracing } from "./tracing";
startTracing();

import { ValidationPipe, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import * as bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

// Helpers

function normalizeOrigin(o: string) {
  return o.replace(/\/$/, "");
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v || String(v).trim() === "") {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function requireRuntimeEnv() {
  requireEnv("DATABASE_URL");
  requireEnv("JWT_SECRET");

  if (!isProduction()) return;

  requireEnv("JWT_REFRESH_SECRET");
  requireEnv("WEB_ORIGIN");
  requireEnv("STRIPE_SECRET_KEY");
  requireEnv("STRIPE_WEBHOOK_SECRET");

  const cookieSecureRaw = String(process.env.COOKIE_SECURE ?? "").toLowerCase();
  if (!(cookieSecureRaw === "true" || cookieSecureRaw === "1")) {
    throw new Error("In production, COOKIE_SECURE must be true.");
  }
}

function getPort(): number {
  const raw = process.env.PORT;
  if (!raw) return 4000;

  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 4000;
  return Math.trunc(n);
}

// Request id

function extractRequestId(req: any): string {
  const h = req.headers?.["x-request-id"] ?? req.headers?.["X-Request-Id"];

  if (typeof h === "string" && h.trim() !== "") {
    return h.trim();
  }
  return `req_${randomUUID()}`;
}

// Bootstrap

async function bootstrap() {
  requireRuntimeEnv();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  // Behind load balancers/proxies we want correct client IP/proto.
  const http = app.getHttpAdapter().getInstance();
  http.set("trust proxy", 1);
  http.disable("x-powered-by");

  // Enable graceful shutdown in all environments.
  app.enableShutdownHooks();

  // Stripe webhook must receive raw body before JSON parser.
  app.use(
    "/payments/webhook",
    bodyParser.raw({ type: "application/json" }),
    (req: any, _res: any, next: any) => {
      req.rawBody = req.body; // Buffer
      next();
    },
  );

  // All remaining routes use normal JSON/urlencoded parsing.
  app.use(bodyParser.json({ limit: "1mb" }));
  app.use(bodyParser.urlencoded({ extended: true }));

  // Baseline HTTP hardening headers.
  app.use((_req: any, res: any, next: any) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    if (isProduction()) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
      );
    }
    next();
  });

  app.use(cookieParser());

  // Attach request id to both request and response header.
  app.use((req: any, res: any, next: any) => {
    const rid = extractRequestId(req);
    req.requestId = rid;
    res.setHeader("X-Request-Id", rid);
    next();
  });

  // Single-line access logs for grep/observability tools.
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    const rid = req.requestId;

    res.on("finish", () => {
      const ms = Date.now() - start;
      Logger.log(
        `[HTTP] rid=${rid} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`,
      );
    });

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const allow = (
    isProduction()
      ? [process.env.WEB_ORIGIN]
      : [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          process.env.WEB_ORIGIN,
        ]
  )
    .filter(Boolean)
    .map((o) => normalizeOrigin(String(o)));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = normalizeOrigin(origin);
      if (allow.includes(normalized)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Idempotency-Key",
      "X-Request-Id",
      "Stripe-Signature",
    ],
    exposedHeaders: ["X-Request-Id"],
  });

  // Environment sanity logs
  Logger.log(`ENV DATABASE_URL: ${process.env.DATABASE_URL ? "✅" : "❌"}`);
  Logger.log(`ENV JWT_SECRET: ${process.env.JWT_SECRET ? "✅" : "❌"}`);
  Logger.log(`ENV WEB_ORIGIN: ${process.env.WEB_ORIGIN ? "✅" : "❌"}`);
  Logger.log(
    `ENV STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? "✅" : "❌"}`,
  );
  Logger.log(
    `ENV STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? "✅" : "❌"}`,
  );

  const port = getPort();
  await app.listen(port);

  Logger.log(`🚀 API running on http://localhost:${port}`);
  Logger.log(`📈 Metrics http://localhost:${port}/metrics`);
  Logger.log(`🩺 Health /health/live , /health/ready`);
}

bootstrap().catch((err) => {
  Logger.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
