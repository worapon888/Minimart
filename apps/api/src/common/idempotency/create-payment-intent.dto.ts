import { IsString, IsOptional, MinLength } from "class-validator";

/**
 * CreatePaymentIntentDto
 *
 * ใช้สำหรับ:
 * POST /checkout/:orderId/pay
 *
 * design:
 * - บังคับ idempotencyKey (กัน double click / network retry)
 * - ไม่รับ amount จาก client (กัน price tampering)
 */
export class CreatePaymentIntentDto {
  /**
   * Idempotency key จาก client
   * ควรเป็น uuid / nanoid / random string
   */
  @IsString()
  @MinLength(8)
  idempotencyKey!: string;

  /**
   * (optional)
   * เผื่ออนาคต: client ส่ง hint เช่น "card", "promptpay"
   * ตอนนี้ยังไม่ใช้ logic
   */
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
