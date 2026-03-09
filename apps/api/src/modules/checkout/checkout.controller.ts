import { Body, Controller, Param, Post } from "@nestjs/common";
import { CheckoutService } from "./checkout.service";
import { StartCheckoutDto } from "./dto/start-checkout.dto";
import { CreateDirectOrderDto } from "./dto/create-direct-order.dto";

import { CreatePaymentIntentDto } from "../payments/dto/create-payment-intent.dto";
import { PaymentsService } from "../payments/payments.service";
import { IdempotencyService } from "../../common/idempotency/idempotency.service";
import {
  checkoutPayDurationMs,
  checkoutPayTotal,
} from "../../metrics/perf-metrics";

import { Audit } from "../../common/audit/audit.decorator";

@Controller("checkout")
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly payments: PaymentsService,
    private readonly idem: IdempotencyService,
  ) {}

  /**
   * POST /checkout/start
   * Flow เดิม: ต้องมี reservationId (สำหรับ flash sale)
   */
  @Post("start")
  @Audit({ action: "CHECKOUT_START", entity: "Reservation" })
  async start(@Body() dto: StartCheckoutDto) {
    return this.checkoutService.startCheckout(dto);
  }

  /**
   * POST /checkout/orders
   * Flow ใหม่: สร้าง order โดยตรงจาก cart items + shipping
   * ใช้สำหรับ checkout ปกติที่ไม่ผ่าน flash sale / reservation
   */
  @Post("orders")
  @Audit({ action: "CHECKOUT_ORDER_CREATE", entity: "Order" })
  async createOrder(@Body() dto: CreateDirectOrderDto) {
    return this.idem.getOrCreate({
      scope: "checkout.orders",
      key: dto.idempotencyKey,
      payload: { dto },
      handler: () => this.checkoutService.createDirectOrder(dto),
    });
  }

  /**
   * POST /checkout/:orderId/pay
   * ขอ Stripe clientSecret จาก orderId ที่สร้างไว้แล้ว
   */
  @Post(":orderId/pay")
  @Audit({ action: "CHECKOUT_PAY", entity: "Order" })
  async pay(
    @Param("orderId") orderId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    const start = Date.now();

    try {
      const response = await this.idem.getOrCreate({
        scope: "checkout.pay",
        key: dto.idempotencyKey ?? `pi-${orderId}`,
        payload: { orderId, dto },
        handler: async () => {
          const intent = await this.payments.createPaymentIntentForOrder(orderId);
          return { orderId, ...intent };
        },
      });

      const ms = Date.now() - start;
      checkoutPayTotal.inc({ status: "ok" });
      checkoutPayDurationMs.observe({ status: "ok" }, ms);
      return response;
    } catch (err) {
      const ms = Date.now() - start;
      checkoutPayTotal.inc({ status: "error" });
      checkoutPayDurationMs.observe({ status: "error" }, ms);
      throw err;
    }
  }
}
