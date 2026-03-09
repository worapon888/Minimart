import { Controller, Get, Header } from "@nestjs/common";
import { MetricsService } from "./metrics.service";

@Controller()
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get("/metrics")
  @Header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
  async metricsText() {
    // prom-client จะ override content-type ได้ แต่ใส่ header กันพลาดไว้
    return this.metrics.metricsText();
  }
}
