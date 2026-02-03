import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { ScheduleModule } from "@nestjs/schedule";
import * as path from "node:path";
import * as fs from "node:fs";

import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { InventoryModule } from "./inventory/inventory.module";
import { ReservationsModule } from "./modules/reservations/reservations.module";
import { CheckoutModule } from "./checkout/checkout.module";
import { WebhooksModule } from "./webhooks/webhooks.module";

// ✅ หา .env แบบไม่พึ่ง cwd
const envInCwd = path.join(process.cwd(), ".env");
const envNextToApp = path.resolve(__dirname, "..", ".env"); // dist/src case
const envInAppsApi = path.resolve(process.cwd(), "apps", "api", ".env"); // เผื่อรันจาก root

const envFilePath = fs.existsSync(envInCwd)
  ? envInCwd
  : fs.existsSync(envNextToApp)
    ? envNextToApp
    : envInAppsApi; // fallback

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),

    ScheduleModule.forRoot(),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ttl = Number(config.get("CACHE_TTL_MS") ?? 60_000);
        const max = Number(config.get("CACHE_MAX") ?? 200);
        return { ttl, max };
      },
    }),

    PrismaModule,
    ProductsModule,
    InventoryModule,
    ReservationsModule,
    CheckoutModule,
    WebhooksModule,
  ],
})
export class AppModule {}
