import { Body, Controller, Post } from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { PaymentWebhookDto } from "./dto/payment-webhook.dto";

@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * POST /webhooks/payment
   *
   * payload ตัวอย่าง:
   * {
   *   "provider": "mock",
   *   "eventId": "evt_test_0001",
   *   "type": "payment_intent.succeeded",
   *   "data": { "paymentIntentId": "...", "orderId": "..." }
   * }
   */
  @Post("payment")
  async payment(@Body() dto: PaymentWebhookDto) {
    return this.webhooksService.handlePaymentWebhook({
      provider: dto.provider,
      eventId: dto.eventId,
      type: dto.type,
      data: dto.data,
      rawPayload: dto, // เก็บ payload ลง db เพื่อ debug ได้
    });
  }
}
