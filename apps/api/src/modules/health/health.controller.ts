import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { PrismaHealthIndicator } from "./prisma.health";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
  ) {}

  // liveness: process ยังอยู่
  @Get("live")
  live() {
    return { ok: true };
  }

  // readiness: ต่อ DB ได้จริง
  @Get("ready")
  @HealthCheck()
  ready() {
    return this.health.check([() => this.prisma.isHealthy("db")]);
  }
}
