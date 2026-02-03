import { Body, Controller, Param, Post } from "@nestjs/common";
import { CheckoutService } from "./checkout.service";
import { StartCheckoutDto } from "./dto/start-checkout.dto";

import { CreatePaymentIntentDto } from "../common/idempotency/create-payment-intent.dto";
import { PaymentsService } from "../payments/payments.service";
import { IdempotencyService } from "../common/idempotency/idempotency.service";

@Controller("checkout")
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly payments: PaymentsService,
    private readonly idem: IdempotencyService,
  ) {}

  // ✅ กลับมามี route นี้อีกครั้ง
  @Post("start")
  async start(@Body() dto: StartCheckoutDto) {
    return this.checkoutService.startCheckout(dto);
  }

  @Post(":orderId/pay")
  async pay(
    @Param("orderId") orderId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.idem.getOrCreate({
      scope: "checkout.pay",
      key: dto.idempotencyKey,
      payload: { orderId, dto },
      handler: async () => {
        const intent = await this.payments.createPaymentIntentForOrder(orderId);
        return { orderId, ...intent };
      },
    });
  }
}
