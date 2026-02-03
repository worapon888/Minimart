import { IsIn, IsObject, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class PaymentWebhookDataDto {
  @IsString()
  paymentIntentId!: string;

  @IsString()
  orderId!: string;
}

/**
 * PaymentWebhookDto
 *
 * POST /webhooks/payment
 *
 * ตัวอย่าง payload:
 * {
 *   "provider": "mock",
 *   "eventId": "evt_test_0001",
 *   "type": "payment_intent.succeeded",
 *   "data": { "paymentIntentId": "...", "orderId": "..." }
 * }
 *
 * หมายเหตุ:
 * - provider เอาไว้ทำ @@unique([provider, eventId]) ใน WebhookEvent
 * - eventId ใช้ dedupe กัน webhook ยิงซ้ำ
 */
export class PaymentWebhookDto {
  @IsString()
  provider!: string; // เช่น "mock" หรือ "stripe" (อนาคต)

  @IsString()
  eventId!: string;

  @IsString()
  @IsIn(["payment_intent.succeeded", "payment_intent.failed"])
  type!: "payment_intent.succeeded" | "payment_intent.failed";

  @IsObject()
  @ValidateNested()
  @Type(() => PaymentWebhookDataDto)
  data!: PaymentWebhookDataDto;
}
