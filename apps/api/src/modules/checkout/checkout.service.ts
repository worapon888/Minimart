import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { StartCheckoutDto } from "./dto/start-checkout.dto";
import { CreateDirectOrderDto } from "./dto/create-direct-order.dto";

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /checkout/start
   * Flow เดิม: ต้องผ่าน reservation (flash sale)
   */
  async startCheckout(dto: StartCheckoutDto) {
    const { reservationId, idempotencyKey } = dto;

    if (idempotencyKey) {
      const existed = await this.prisma.order.findUnique({
        where: { idempotencyKey },
        select: { id: true, status: true },
      });
      if (existed) return { orderId: existed.id, status: existed.status };
    }

    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { flashSaleItem: true },
      });

      if (!reservation) throw new NotFoundException("Reservation not found");
      if (reservation.status !== "ACTIVE")
        throw new BadRequestException("Reservation is not ACTIVE");
      if (reservation.expiresAt.getTime() < Date.now())
        throw new BadRequestException("Reservation expired");

      const product = await tx.product.findUnique({
        where: { id: reservation.flashSaleItem.productId },
      });
      if (!product) throw new NotFoundException("Product not found");

      const already = await tx.order.findUnique({
        where: { reservationId },
        select: { id: true, status: true },
      });
      if (already)
        throw new ConflictException(
          "Order already created for this reservation",
        );

      const qty = reservation.qty;
      if (!Number.isInteger(qty) || qty <= 0)
        throw new BadRequestException("Invalid reservation qty");

      const unit = product.priceCents;
      const currency = product.currency ?? "USD";
      const subtotal = unit * qty;

      const created = await tx.order.create({
        data: {
          status: "PENDING",
          reservationId: reservation.id,
          idempotencyKey: idempotencyKey ?? null,
          currency,
          subtotalCents: subtotal,
          totalCents: subtotal,
          items: {
            create: [
              {
                productId: product.id,
                qty,
                unitPriceCents: unit,
                lineTotalCents: subtotal,
              },
            ],
          },
        },
        select: { id: true, status: true },
      });

      return { orderId: created.id, status: created.status };
    });
  }

  /**
   * POST /checkout/orders
   * Flow ใหม่: สร้าง order โดยตรงจาก cart (ไม่ต้องผ่าน reservation)
   *
   * - validate products ทุกตัวว่ายังมีอยู่
   * - คำนวณราคาจาก DB เท่านั้น (ไม่ trust ราคาจาก FE)
   * - สร้าง Order + OrderItems + ShippingInfo ใน transaction เดียว
   */
  async createDirectOrder(dto: CreateDirectOrderDto) {
    const { items, shipping, idempotencyKey } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1. โหลด products ทั้งหมดในครั้งเดียว
      const productIds = items.map((it) => it.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, priceCents: true, currency: true, title: true },
      });

      // 2. validate ว่า product ครบทุกตัว
      const productMap = new Map(products.map((p) => [p.id, p]));
      for (const item of items) {
        if (!productMap.has(item.productId)) {
          throw new NotFoundException(`Product not found: ${item.productId}`);
        }
      }

      // 3. คำนวณราคาจาก DB (ไม่ trust FE)
      const currency = products[0]?.currency ?? "USD";
      let subtotalCents = 0;
      const orderItems = items.map((item) => {
        const product = productMap.get(item.productId)!;
        const lineTotal = product.priceCents * item.qty;
        subtotalCents += lineTotal;
        return {
          productId: product.id,
          qty: item.qty,
          unitPriceCents: product.priceCents,
          lineTotalCents: lineTotal,
        };
      });

      if (subtotalCents <= 0) {
        throw new BadRequestException("Order total must be greater than 0");
      }

      // 4. shipping cost (hardcoded $2.99 = 299 cents ตรงกับ FE)
      const shippingCents = 299;
      const totalCents = subtotalCents + shippingCents;

      // 5. สร้าง Order + OrderItems + ShippingInfo
      const created = await tx.order.create({
        data: {
          status: "PENDING",
          idempotencyKey,
          currency,
          subtotalCents,
          totalCents,
          items: {
            create: orderItems,
          },
          // ✅ ถ้า schema มี shippingInfo relation ให้ uncomment บรรทัดด้านล่าง
          // shippingInfo: {
          //   create: {
          //     name: shipping.name,
          //     tel: shipping.tel,
          //     address: shipping.address,
          //     email: shipping.email ?? null,
          //   },
          // },
        },
        select: { id: true, status: true },
      });

      return { orderId: created.id, status: created.status };
    });
  }
}
