import { IsString, IsOptional, MinLength, IsNotEmpty } from "class-validator";

/**
 * CreatePaymentIntentDto
 *
 * ใช้สำหรับ:
 * - POST /payments/intent        → ส่ง orderId ใน body
 * - POST /checkout/:orderId/pay  → orderId มาจาก URL path ไม่ต้องส่งใน body
 *
 * design:
 * - orderId เป็น optional เพราะ checkout flow ส่งมาทาง URL path แทน
 * - ไม่รับ amount จาก client (กัน price tampering)
 */
export class CreatePaymentIntentDto {
  /**
   * Order ID ที่จะจ่ายเงิน
   * optional เพราะ POST /checkout/:orderId/pay ส่งมาทาง path param แทน
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  orderId?: string;

  /**
   * Idempotency key จาก client (optional)
   * ถ้าไม่ส่งมา controller จะ generate ให้
   */
  @IsOptional()
  @IsString()
  @MinLength(8)
  idempotencyKey?: string;

  /**
   * (optional)
   * เผื่ออนาคต: client ส่ง hint เช่น "card", "promptpay"
   */
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
