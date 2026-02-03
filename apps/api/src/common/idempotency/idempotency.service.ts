import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import crypto from "crypto";

/**
 * IdempotencyService
 *
 * ใช้สำหรับ:
 * - กัน client retry / double click
 * - กัน network glitch
 * - ให้ endpoint ปลอดภัยแบบ Stripe-style
 *
 * ทำงานกับ table:
 * IdempotencyKey { scope + key @unique }
 */
@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * hash payload เพื่อเช็คว่า
   * idempotency key เดิม ถูกใช้กับ payload เดิมหรือไม่
   */
  private hashPayload(payload: unknown): string {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex");
  }

  /**
   * getOrCreate
   *
   * - ถ้า key ยังไม่เคยใช้ → run handler → save response
   * - ถ้า key เคยใช้แล้ว → return response เดิม
   * - ถ้า key เดิม แต่ payload เปลี่ยน → throw error
   */
  async getOrCreate<T>(params: {
    scope: string;
    key: string;
    payload: unknown;
    handler: () => Promise<T>;
  }): Promise<T> {
    const { scope, key, payload, handler } = params;
    const requestHash = this.hashPayload(payload);

    const existing = await this.prisma.idempotencyKey.findUnique({
      where: {
        scope_key: {
          scope,
          key,
        },
      },
    });

    // ✅ เคยใช้ key นี้แล้ว
    if (existing) {
      // payload เปลี่ยน = misuse
      if (existing.requestHash !== requestHash) {
        throw new BadRequestException(
          "Idempotency key already used with different payload",
        );
      }

      return existing.response as T;
    }

    // ✅ ครั้งแรก: execute logic จริง
    const response = await handler();

    // save result
    await this.prisma.idempotencyKey.create({
      data: {
        scope,
        key,
        requestHash,
        response: response as any,
      },
    });

    return response;
  }
}
