import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp ? exception.getResponse() : null;

    const message =
      this.normalizeMessage(responseBody) ??
      (exception instanceof Error
        ? exception.message
        : "Internal server error");

    const payload = {
      ok: false,
      statusCode: status,
      message,
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    };

    // log เฉพาะ 5xx ให้ดูโปรขึ้น
    if (status >= 500) {
      this.logger.error(
        `[${req.method}] ${req.url} -> ${status} | ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    res.status(status).json(payload);
  }

  private normalizeMessage(body: unknown): string | undefined {
    if (!body) return;
    if (typeof body === "string") return body;

    if (typeof body === "object" && body !== null) {
      const anyBody = body as any;
      if (Array.isArray(anyBody.message)) return anyBody.message.join(", ");
      if (typeof anyBody.message === "string") return anyBody.message;
    }
    return;
  }
}
