import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class ThrottlerClientGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId = req.user?.id;
    if (userId) return `user:${userId}`;

    const headers = (req.headers ?? {}) as Record<string, unknown>;

    const raw =
      headers["x-client-id"] ?? headers["x-clientid"] ?? headers["x-client_id"];

    const clientId = Array.isArray(raw) ? raw[0] : raw;
    if (typeof clientId === "string" && clientId.trim() !== "") {
      return `client:${clientId.trim()}`;
    }

    return (req.ip as string) || "unknown";
  }
}
