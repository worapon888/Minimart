import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";

type HandlePaymentWebhookInput = {
  provider: string;
  eventId: string;
  type: "payment_intent.succeeded" | "payment_intent.failed";
  data: {
    paymentIntentId: string;
    orderId: string;
  };
  rawPayload?: unknown;
};

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  async handlePaymentWebhook(input: HandlePaymentWebhookInput) {
    const { provider, eventId, type, data, rawPayload } = input;

    // ✅ input guard
    if (!provider || !eventId) {
      throw new BadRequestException("provider and eventId are required");
    }
    if (!data?.paymentIntentId || !data?.orderId) {
      throw new BadRequestException(
        "data.paymentIntentId and data.orderId are required",
      );
    }

    // ✅ fast-path dedupe
    const existed = await this.prisma.webhookEvent.findUnique({
      where: { provider_eventId: { provider, eventId } },
      select: { id: true },
    });
    if (existed) return { ok: true, deduped: true };

    const succeeded = type === "payment_intent.succeeded";
    const now = new Date();

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1) create event (unique provider+eventId)
        await tx.webhookEvent.create({
          data: {
            provider,
            eventId,
            type,
            payload: (rawPayload ?? input) as any,
          },
        });

        // 2) validate PI belongs to order
        const pi = await tx.paymentIntent.findUnique({
          where: { id: data.paymentIntentId },
          select: { id: true, orderId: true, status: true },
        });
        if (!pi) throw new NotFoundException("PaymentIntent not found");
        if (pi.orderId !== data.orderId) {
          throw new BadRequestException(
            "paymentIntentId does not belong to orderId",
          );
        }

        // 3) update PI status (do not downgrade)
        //    - ถ้า PI SUCCEEDED แล้ว แล้ว webhook failed ยิงมา -> ignore
        const nextPiStatus = succeeded ? "SUCCEEDED" : "FAILED";
        const piCanUpdate =
          succeeded || (pi.status !== ("SUCCEEDED" as any) && !succeeded);

        if (piCanUpdate) {
          await tx.paymentIntent.updateMany({
            where: { id: data.paymentIntentId },
            data: { status: nextPiStatus as any },
          });
        }

        // 4) update Order (idempotent + no downgrade)
        //    - succeeded: PENDING -> PAID (+paidAt)
        //    - failed:    PENDING -> CANCELED
        //    - ถ้า order ไม่ใช่ PENDING แล้ว: ไม่แตะ (กันเพี้ยน)
        const transitioned = await tx.order.updateMany({
          where: { id: data.orderId, status: "PENDING" },
          data: succeeded
            ? { status: "PAID", paidAt: now }
            : { status: "CANCELED" },
        });

        const orderStatusApplied = transitioned.count === 1;

        // 4b) backfill paidAt (เฉพาะ succeeded และไม่ได้ transition เพราะอาจ PAID อยู่แล้ว)
        let paidAtBackfilled = false;
        if (succeeded && !orderStatusApplied) {
          const backfilled = await tx.order.updateMany({
            where: { id: data.orderId, status: "PAID", paidAt: null },
            data: { paidAt: now },
          });
          paidAtBackfilled = backfilled.count === 1;
        }

        // 5) commit flash sale ONLY when first transition happened
        let flashSaleCommitted = false;

        if (succeeded && orderStatusApplied) {
          const order = await tx.order.findUnique({
            where: { id: data.orderId },
            select: {
              reservation: {
                select: {
                  id: true,
                  status: true,
                  qty: true,
                  flashSaleItemId: true,
                },
              },
            },
          });

          if (!order) throw new NotFoundException("Order not found");
          if (!order.reservation) {
            throw new BadRequestException("Order has no reservation to commit");
          }

          const r = order.reservation;

          // commit เฉพาะ ACTIVE (กันยิงซ้ำ)
          if (r.status === "ACTIVE") {
            await tx.reservation.update({
              where: { id: r.id },
              data: { status: "CONFIRMED" },
            });

            await tx.flashSaleItem.update({
              where: { id: r.flashSaleItemId },
              data: {
                reserved: { decrement: r.qty },
                sold: { increment: r.qty },
                stock: { decrement: r.qty },
              },
            });

            flashSaleCommitted = true;
          }
        }

        return {
          ok: true,
          deduped: false,
          type,
          paymentIntentUpdated: piCanUpdate,
          orderStatusApplied,
          paidAtBackfilled,
          flashSaleCommitted,
        };
      });
    } catch (err) {
      // ✅ race condition: unique(provider,eventId)
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") return { ok: true, deduped: true };
      }
      throw err;
    }
  }
}
