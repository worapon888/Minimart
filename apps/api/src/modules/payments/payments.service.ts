import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import Stripe from "stripe";

type CreatePaymentIntentResult = {
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
};

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // ✅ ระบุ API version ให้ชัดเจน ป้องกัน breaking changes จาก Stripe
      apiVersion: "2026-02-25.clover",
    });
  }

  private isTestStripeBypassEnabled(): boolean {
    if (process.env.NODE_ENV !== "test") return false;
    const key = String(process.env.STRIPE_SECRET_KEY ?? "");
    return !key || key.includes("replace_me");
  }

  /**
   * สร้าง Stripe PaymentIntent จริง
   *
   * rules:
   * - amount/currency ต้องมาจาก DB เท่านั้น (ห้าม trust FE)
   * - Order ต้องเป็น PENDING
   * - idempotent ทั้งระดับ Stripe และ DB
   *
   * ✅ idempotencyKey เป็น optional เพราะ CheckoutController ส่งมาผ่าน IdempotencyService แล้ว
   */
  async createPaymentIntentForOrder(
    orderId: string,
    idempotencyKey?: string,
  ): Promise<CreatePaymentIntentResult> {
    // ── 1. โหลด Order ──────────────────────────────────────────────────────
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        totalCents: true,
        currency: true,
      },
    });

    if (!order) throw new NotFoundException("Order not found");

    if (order.status !== "PENDING") {
      throw new BadRequestException(
        `Order is not payable (status=${order.status})`,
      );
    }

    if (order.totalCents <= 0) {
      throw new BadRequestException("Order total must be greater than 0");
    }

    // ── 2. DB-level idempotency ─────────────────────────────────────────────
    // ถ้าเคยสร้าง PaymentIntent ไว้แล้ว คืนตัวเดิมทันทีโดยไม่ยิง Stripe ซ้ำ
    const existing = await this.prisma.paymentIntent.findUnique({
      where: { orderId },
      select: {
        id: true,
        providerIntentId: true,
        clientSecret: true,
        status: true,
        amount: true,
        currency: true,
      },
    });

    if (existing?.clientSecret) {
      return {
        paymentIntentId: existing.id,
        clientSecret: existing.clientSecret,
        status: existing.status,
        amount: existing.amount,
        currency: existing.currency,
      };
    }

    // ── 3. สร้าง PaymentIntent (Stripe จริง หรือ test bypass) ─────────────
    const key = idempotencyKey ?? `pi-${orderId}`; // fallback key ถ้าไม่ส่งมา
    const stripeIntent = this.isTestStripeBypassEnabled()
      ? {
          id: `pi_test_${randomUUID().replace(/-/g, "")}`,
          client_secret: `pi_test_secret_${randomUUID().replace(/-/g, "")}`,
        }
      : await this.stripe.paymentIntents.create(
          {
            amount: order.totalCents,
            currency: order.currency.toLowerCase(), // Stripe ใช้ lowercase เสมอ
            automatic_payment_methods: { enabled: true },
            metadata: {
              orderId: order.id, // ✅ สำคัญมาก — webhook จะใช้ค่านี้ map กลับมา
            },
          },
          { idempotencyKey: key },
        );

    if (!stripeIntent.client_secret) {
      throw new BadRequestException(
        "Payment provider did not return a client_secret.",
      );
    }

    // ── 4. บันทึกลง DB ─────────────────────────────────────────────────────
    const created = await this.prisma.paymentIntent.create({
      data: {
        orderId: order.id,
        provider: "STRIPE",
        providerIntentId: stripeIntent.id,
        clientSecret: stripeIntent.client_secret,
        amount: order.totalCents,
        currency: order.currency,
        status: "REQUIRES_PAYMENT_METHOD",
        idempotencyKey: key,
      },
      select: {
        id: true,
        clientSecret: true,
        status: true,
        amount: true,
        currency: true,
      },
    });

    return {
      paymentIntentId: created.id,
      clientSecret: created.clientSecret,
      status: created.status,
      amount: created.amount,
      currency: created.currency,
    };
  }

  /**
   * ✅ ใช้ใน webhook เท่านั้น — ห้ามให้ FE เรียกเอง
   * อัพเดต PaymentIntent และ Order เป็น PAID ใน transaction เดียว
   */
  async markPaymentSucceeded(params: {
    providerIntentId: string;
  }): Promise<void> {
    const { providerIntentId } = params;

    await this.prisma.$transaction(async (tx) => {
      // ✅ upsert-style: ถ้า webhook ยิงซ้ำก็ไม่พัง
      const paymentIntent = await tx.paymentIntent.update({
        where: { providerIntentId },
        data: { status: "SUCCEEDED" },
        select: { orderId: true },
      });

      await tx.order.update({
        where: { id: paymentIntent.orderId },
        data: { status: "PAID" },
      });
    });
  }

  /**
   * ✅ ใช้ใน webhook เท่านั้น
   * mark เฉพาะ PaymentIntent ว่า FAILED (Order ยังคง PENDING เผื่อ retry)
   */
  async markPaymentFailed(params: { providerIntentId: string }): Promise<void> {
    const { providerIntentId } = params;

    await this.prisma.paymentIntent.update({
      where: { providerIntentId },
      data: { status: "FAILED" },
    });
  }
}
