import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { PrismaHealthIndicator } from "./prisma.health";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaService, PrismaHealthIndicator],
})
export class HealthModule {}
