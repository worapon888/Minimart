import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StartCheckoutDto } from "./dto/start-checkout.dto";

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /checkout/start
   * body: { reservationId, idempotencyKey? }
   *
   * Flow:
   * - validate reservation: exists, status=ACTIVE, not expired
   * - ensure no order already created for this reservation
   * - (optional) idempotency: if idempotencyKey exists and order already created, return it
   * - create Order(PENDING) + OrderItem(1 row) from reservation -> flashSaleItem -> product
   * - return { orderId, status }
   */
  async startCheckout(dto: StartCheckoutDto) {
    const { reservationId, idempotencyKey } = dto;

    // ✅ idempotency: ถ้า key นี้เคยสร้าง order แล้ว -> คืนของเดิมทันที
    if (idempotencyKey) {
      const existed = await this.prisma.order.findUnique({
        where: { idempotencyKey },
        select: { id: true, status: true },
      });
      if (existed) return { orderId: existed.id, status: existed.status };
    }

    return this.prisma.$transaction(async (tx) => {
      // 1) โหลด reservation -> flashSaleItem -> product
      // 1) โหลด reservation -> flashSaleItem
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: {
          flashSaleItem: true,
        },
      });

      if (!reservation) throw new NotFoundException("Reservation not found");

      // 2) validate reservation
      if (reservation.status !== "ACTIVE") {
        throw new BadRequestException("Reservation is not ACTIVE");
      }
      if (reservation.expiresAt.getTime() < Date.now()) {
        throw new BadRequestException("Reservation expired");
      }

      // 3) โหลด product ด้วย productId จาก flashSaleItem
      const product = await tx.product.findUnique({
        where: { id: reservation.flashSaleItem.productId },
      });

      if (!product) throw new NotFoundException("Product not found");

      // 3) กัน reservation เดิมถูกใช้สร้าง order ไปแล้ว
      // (เพราะใน schema เราตั้ง reservationId เป็น @unique ใน Order)
      const already = await tx.order.findUnique({
        where: { reservationId },
        select: { id: true, status: true },
      });
      if (already) {
        // ถ้า FE เผลอยิงซ้ำแบบไม่มี idempotencyKey ก็ยังไม่พัง
        throw new ConflictException(
          "Order already created for this reservation",
        );
      }

      // 4) calc price
      const qty = reservation.qty;
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new BadRequestException("Invalid reservation qty");
      }

      const unit = product.priceCents;
      const currency = product.currency ?? "USD";
      const subtotal = unit * qty;
      const total = subtotal; // เผื่ออนาคตมี tax/discount/shipping

      // 5) create Order(PENDING) + OrderItem
      const created = await tx.order.create({
        data: {
          status: "PENDING",
          reservationId: reservation.id,
          idempotencyKey: idempotencyKey ?? null,
          currency,
          subtotalCents: subtotal,
          totalCents: total,
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

      // 6) (แนะนำ) เปลี่ยนสถานะ reservation เป็น CONFIRMED ตอนเริ่ม checkout
      // ถ้าคุณอยาก "ล็อกให้แน่น" ว่ากำลังไปจ่ายเงินจริง
      // แต่ถ้าคุณจะรอให้จ่ายสำเร็จค่อย CONFIRMED -> ย้าย step นี้ไปตอน webhook "PAID"
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: "CONFIRMED" },
      });

      return { orderId: created.id, status: created.status };
    });
  }
}
