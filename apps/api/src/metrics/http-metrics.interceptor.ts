import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { MetricsService } from "./metrics.service";

function normalizeRoute(req: any): string {
  // Nest จะมี route pattern ใน req.route?.path บางกรณี
  if (req?.route?.path) return req.route.path;

  // fallback: ตัด query และลดความเฉพาะเจาะจงของ id แบบง่าย
  const url = String(req?.originalUrl || req?.url || "/");
  const path = url.split("?")[0];

  // แปลง path segment ที่ดูเหมือน id ให้เป็น :id (กัน label explosion)
  return path
    .split("/")
    .map((seg) => {
      if (!seg) return seg;
      if (seg.length >= 18) return ":id"; // cuid/uuid ยาวๆ
      if (/^\d+$/.test(seg)) return ":id";
      return seg;
    })
    .join("/");
}

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const start = Date.now();
    const method = String(req.method || "GET");
    const route = normalizeRoute(req);

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        const status = String(res.statusCode || 200);
        this.metrics.httpRequestsTotal.inc({ method, route, status });
        this.metrics.httpRequestDurationMs.observe(
          { method, route, status },
          ms,
        );
      }),
      catchError((err) => {
        const ms = Date.now() - start;
        const status = String(res.statusCode || 500);
        this.metrics.httpRequestsTotal.inc({ method, route, status });
        this.metrics.httpRequestDurationMs.observe(
          { method, route, status },
          ms,
        );
        throw err;
      }),
    );
  }
}
