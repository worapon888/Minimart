// apps/api/src/common/middleware/request-id.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const rid = req.header("x-request-id") ?? `req_${randomUUID()}`;
    (req as any).requestId = rid;
    res.setHeader("X-Request-Id", rid);
    next();
  }
}
