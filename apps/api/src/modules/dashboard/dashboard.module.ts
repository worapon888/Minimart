import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";

import { DashboardJobs } from "./job/dashboard.jobs";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";

@Module({
  imports: [
    CacheModule.register({
      ttl: 30_000, // 30s
      max: 500,
    }),
  ],
  providers: [DashboardJobs, DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
