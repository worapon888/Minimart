import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

import { config } from "dotenv";
import * as path from "node:path";
import * as fs from "node:fs";

function loadEnv() {
  const candidates = [
    path.join(process.cwd(), ".env"),
    path.resolve(process.cwd(), "apps/api/.env"),
    path.resolve(__dirname, "..", ".env"),
  ];

  const envPath = candidates.find((p) => fs.existsSync(p));
  if (envPath) config({ path: envPath });

  return envPath;
}

function normalizeOrigin(o: string) {
  return o.replace(/\/$/, ""); // ตัด / ท้าย
}

async function bootstrap() {
  const envPath = loadEnv();
  Logger.log(`ENV loaded from: ${envPath ?? "NOT FOUND"}`);
  Logger.log(`ENV DATABASE_URL: ${process.env.DATABASE_URL ? "✅" : "❌"}`);

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const allow = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.WEB_ORIGIN,
  ]
    .filter(Boolean)
    .map((o) => normalizeOrigin(String(o)));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allow.includes(normalizeOrigin(origin))) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);

  Logger.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();
