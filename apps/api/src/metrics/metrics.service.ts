import { Injectable } from "@nestjs/common";
import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from "prom-client";

@Injectable()
export class MetricsService {
  readonly registry = new Registry();

  // HTTP request count
  readonly httpRequestsTotal = new Counter({
    name: "http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "route", "status"] as const,
    registers: [this.registry],
  });

  // HTTP latency
  readonly httpRequestDurationMs = new Histogram({
    name: "http_request_duration_ms",
    help: "HTTP request duration in ms",
    labelNames: ["method", "route", "status"] as const,
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry });
  }

  metricsText() {
    return this.registry.metrics();
  }

  contentType() {
    return this.registry.contentType;
  }
}
