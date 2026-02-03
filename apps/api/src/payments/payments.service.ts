import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import crypto from "crypto";

type CreatePaymentIntentResult = {
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
};

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * สร้าง PaymentIntent ให้ Order (Stripe-style)
   *
   * rules:
   * - amount/currency ต้องมาจาก server เท่านั้น (Order.totalCents / currency)
   * - Order ต้องอยู่สถานะ PENDING เท่านั้น
   * - ถ้ามี intent อยู่แล้ว => คืนตัวเดิม (idempotent)
   */
  async createPaymentIntentForOrder(
    orderId: string,
  ): Promise<CreatePaymentIntentResult> {
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

    // ✅ idempotent: ถ้ามีอยู่แล้วคืนตัวเดิม
    const existing = await this.prisma.paymentIntent.findUnique({
      where: { orderId },
      select: {
        id: true,
        clientSecret: true,
        status: true,
        amount: true,
        currency: true,
      },
    });

    if (existing) {
      return {
        paymentIntentId: existing.id,
        clientSecret: existing.clientSecret,
        status: existing.status,
        amount: existing.amount,
        currency: existing.currency,
      };
    }

    const amount = order.totalCents;
    if (amount <= 0) {
      throw new BadRequestException("Order total must be greater than 0");
    }

    const created = await this.prisma.paymentIntent.create({
      data: {
        orderId,
        amount,
        currency: order.currency,
        // status default = REQUIRES_PAYMENT_METHOD (ตาม schema)
        clientSecret: this.makeClientSecret(),
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
   * (optional helper)
   * ใช้ใน webhook: update status ของ payment intent แบบปลอดภัย
   */
  async setPaymentIntentStatus(params: {
    paymentIntentId: string;
    status: "PROCESSING" | "SUCCEEDED" | "FAILED";
  }) {
    const { paymentIntentId, status } = params;

    return this.prisma.paymentIntent.update({
      where: { id: paymentIntentId },
      data: { status },
      select: {
        id: true,
        orderId: true,
        status: true,
        amount: true,
        currency: true,
        updatedAt: true,
      },
    });
  }

  private makeClientSecret(): string {
    // Stripe-ish: pi_secret_...
    const rand = crypto.randomBytes(24).toString("hex");
    return `pi_secret_${rand}`;
  }
}
