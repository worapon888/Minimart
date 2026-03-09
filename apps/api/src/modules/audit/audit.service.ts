import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ApiAuditStatus } from "@prisma/client";

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(input: {
    actorId?: string | null;
    action: string;
    method: string;
    path: string;
    status: ApiAuditStatus;
    httpCode?: number | null;
    entity?: string | null;
    entityId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    meta?: unknown;
  }) {
    return this.prisma.apiAuditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        method: input.method,
        path: input.path,
        status: input.status,
        httpCode: input.httpCode ?? null,
        entity: input.entity ?? null,
        entityId: input.entityId ?? null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        meta: this.redactSecrets(input.meta),
      },
    });
  }

  private redactSecrets(meta: unknown) {
    if (!meta || typeof meta !== "object") return meta;

    const clone = JSON.parse(JSON.stringify(meta));
    const badKeys = [
      "password",
      "passwordHash",
      "token",
      "accessToken",
      "refreshToken",
      "secret",
      "clientSecret",
      "jwt",
      "authorization",
    ];

    const walk = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      for (const k of Object.keys(obj)) {
        if (badKeys.includes(k)) obj[k] = "[REDACTED]";
        else walk(obj[k]);
      }
    };

    walk(clone);
    return clone;
  }
}
