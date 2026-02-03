import { Module } from "@nestjs/common";
import { CheckoutController } from "./checkout.controller";
import { CheckoutService } from "./checkout.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PaymentsModule } from "../payments/payments.module";
import { IdempotencyService } from "../common/idempotency/idempotency.service";

@Module({
  imports: [PrismaModule, PaymentsModule], // ✅ ใช้โมดูลที่ export PaymentsService
  controllers: [CheckoutController],
  providers: [CheckoutService, IdempotencyService], // ✅ เอา PaymentsService ออก
})
export class CheckoutModule {}
