import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, catchError, tap, throwError } from "rxjs";
import { AuditService } from "../../modules/audit/audit.service";
import { AUDIT_META, AUDIT_SKIP, AuditMeta } from "./audit.decorator";
import { ApiAuditStatus } from "@prisma/client";

function getActorId(req: any): string | null {
  // รองรับหลายแบบ (sub/id/userId)
  return req?.user?.sub ?? req?.user?.id ?? req?.user?.userId ?? null;
}

function getIp(req: any): string | null {
  const xff = req.headers?.["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim() !== "") {
    return xff.split(",")[0]?.trim() ?? null;
  }
  return req.ip ?? null;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private audit: AuditService,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();

    // ✅ allow skip
    const skip = this.reflector.get<boolean>(AUDIT_SKIP, ctx.getHandler());
    if (skip) return next.handle();

    // ✅ log เฉพาะ endpoint ที่ติดป้าย @Audit(...)
    const meta = this.reflector.get<AuditMeta>(AUDIT_META, ctx.getHandler());
    if (!meta) return next.handle();

    const actorId = getActorId(req);
    const ip = getIp(req);
    const userAgent = req.headers?.["user-agent"]?.toString() ?? null;

    const method = req.method;
    const path = req.route?.path
      ? `${req.baseUrl ?? ""}${req.route.path}`
      : req.originalUrl;

    // entityId resolver (เลือกแบบ safe)
    const entityId =
      req.params?.id ??
      req.params?.orderId ??
      req.body?.orderId ??
      req.body?.reservationId ??
      req.query?.id ??
      null;

    const common = {
      actorId,
      action: meta.action,
      entity: meta.entity ?? null,
      entityId,
      method,
      path,
      ip,
      userAgent,
      meta: {
        params: req.params,
        query: req.query,
        // ✅ ไม่ log body ทั้งก้อน (กันหลุด secret)
        bodyKeys:
          req.body && typeof req.body === "object"
            ? Object.keys(req.body)
            : undefined,
      },
    };

    return next.handle().pipe(
      tap(() => {
        void this.audit.log({
          ...common,
          status: ApiAuditStatus.SUCCESS,
          httpCode: res?.statusCode ?? 200,
        });
      }),
      catchError((err) => {
        void this.audit.log({
          ...common,
          status: ApiAuditStatus.FAIL,
          httpCode: err?.status ?? res?.statusCode ?? 500,
          meta: {
            ...common.meta,
            error: err?.message,
          },
        });
        return throwError(() => err);
      }),
    );
  }
}
