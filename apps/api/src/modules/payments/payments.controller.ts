import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import Stripe from "stripe";
import { PaymentsService } from "./payments.service";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";

@Controller("payments")
export class PaymentsController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });

  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /payments/intent
   * direct call — orderId ต้องส่งมาใน body
   */
  @Post("intent")
  async createIntent(
    @Body() dto: CreatePaymentIntentDto,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    // ✅ guard: endpoint นี้ต้องการ orderId ใน body
    if (!dto.orderId) {
      throw new BadRequestException("orderId is required in request body");
    }
    const key = idempotencyKey ?? `pi-${dto.orderId}-${Date.now()}`;
    return this.paymentsService.createPaymentIntentForOrder(dto.orderId, key);
  }

  /**
   * POST /payments/webhook
   *
   * ✅ Stripe จะเรียก endpoint นี้หลังจ่ายเงินสำเร็จ/ล้มเหลว
   * ต้องการ raw body เพื่อ verify signature — ห้าม parse JSON ก่อน
   *
   * ต้องเพิ่มใน main.ts:
   *   app.use('/payments/webhook', express.raw({ type: 'application/json' }));
   */
  @Post("webhook")
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") sig: string,
  ) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new UnauthorizedException("Webhook secret not set");

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(req.rawBody!, sig, secret);
    } catch {
      throw new UnauthorizedException("Invalid Stripe webhook signature");
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.paymentsService.markPaymentSucceeded({
          providerIntentId: intent.id,
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.paymentsService.markPaymentFailed({
          providerIntentId: intent.id,
        });
        break;
      }

      default:
        // event types อื่นที่ไม่ได้ handle — ไม่ต้อง throw, แค่ ignore
        break;
    }

    return { received: true };
  }
}
