import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

type HandlePaymentWebhookInput = {
  provider: string;
  eventId: string;
  type: "payment_intent.succeeded" | "payment_intent.failed";
  data: {
    paymentIntentId: string;
    orderId: string;
  };
  rawPayload?: unknown; // เก็บ payload ลง WebhookEvent
};

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotent webhook handler
   *
   * - Dedupe ด้วย (provider, eventId)
   * - ถ้า webhook ยิงซ้ำ => return { ok: true, deduped: true }
   * - ถ้าเพิ่งเคยรับครั้งแรก => process แล้ว return { ok: true, deduped: false }
   */
  async handlePaymentWebhook(input: HandlePaymentWebhookInput) {
    const { provider, eventId, type, data, rawPayload } = input;

    // quick dedupe (fast path)
    const existed = await this.prisma.webhookEvent.findUnique({
      where: { provider_eventId: { provider, eventId } },
      select: { id: true },
    });
    if (existed) return { ok: true, deduped: true };

    // map type -> statuses
    const paymentStatus =
      type === "payment_intent.succeeded" ? "SUCCEEDED" : "FAILED";

    const orderStatus =
      type === "payment_intent.succeeded" ? "PAID" : "CANCELED";
    // ถ้าคุณอยากให้ failed = FAILED จริง ๆ ให้เพิ่ม enum ใน OrderStatus ก่อน
    // ตอนนี้ schema คุณมี PENDING/PAID/CANCELED/EXPIRED => ใช้ CANCELED ไปก่อน

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1) บันทึก event เพื่อกันซ้ำ
        await tx.webhookEvent.create({
          data: {
            provider,
            eventId,
            type,
            payload: (rawPayload ?? input) as any,
          },
        });

        // 2) validate paymentIntent exists + belongs to orderId
        const pi = await tx.paymentIntent.findUnique({
          where: { id: data.paymentIntentId },
          select: { id: true, orderId: true, status: true },
        });
        if (!pi) throw new NotFoundException("PaymentIntent not found");

        // กัน spoof: payload บอก orderId ไม่ตรงกับ paymentIntent.orderId
        if (pi.orderId !== data.orderId) {
          // ไม่ throw แบบ 500; แต่ถือว่า payload ผิด
          // (คุณจะเปลี่ยนเป็น BadRequestException ก็ได้)
          throw new NotFoundException("Order not found");
        }

        // 3) update paymentIntent status แบบ idempotent
        // ถ้ามันเป็น SUCCEEDED/FAILED อยู่แล้ว ยิงซ้ำก็ไม่กระทบ
        await tx.paymentIntent.update({
          where: { id: data.paymentIntentId },
          data: { status: paymentStatus as any },
        });

        // 4) update order status แบบ idempotent (update เฉพาะ PENDING)
        const updated = await tx.order.updateMany({
          where: { id: data.orderId, status: "PENDING" },
          data: { status: orderStatus as any },
        });

        return {
          ok: true,
          deduped: false,
          paymentIntentStatus: paymentStatus,
          orderStatusApplied: updated.count === 1, // false แปลว่า order ไม่ได้อยู่ PENDING แล้ว
        };
      });

      return result;
    } catch (err) {
      // ✅ สำคัญ: กรณี webhook เข้ามาพร้อมกัน (race) จะชน unique (provider,eventId)
      // Prisma จะ throw P2002 -> ถือว่า deduped
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          return { ok: true, deduped: true };
        }
      }
      throw err;
    }
  }
}
