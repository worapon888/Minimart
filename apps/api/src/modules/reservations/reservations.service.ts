// apps/api/src/modules/reservations/reservations.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ReservationStatus } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ✅ TTL จาก env (default 10 นาที)
  private get ttlMs() {
    const raw = this.config.get<string>("RESERVATION_TTL_MS");
    const ttl = Number(raw ?? 600_000);
    return Number.isFinite(ttl) && ttl > 0 ? ttl : 600_000;
  }

  /**
   * Reserve by productId (Product.id) because FlashSaleItem.productId is unique and references Product.id
   */
  async reserve(productId: string, qty: number, requestId?: string) {
    if (!productId || typeof productId !== "string") {
      throw new BadRequestException("productId is required");
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new BadRequestException("qty must be a positive integer");
    }

    const expiresAt = new Date(Date.now() + this.ttlMs);

    return this.prisma.$transaction(async (tx) => {
      // 0) idempotency (optional): ถ้ามี requestId และเคยสร้างแล้วให้ return ตัวเดิม
      if (requestId) {
        const existed = await tx.reservation.findUnique({
          where: { requestId },
          select: {
            id: true,
            flashSaleItemId: true,
            qty: true,
            status: true,
            expiresAt: true,
            createdAt: true,
          },
        });
        if (existed) return existed;
      }

      // 1) หา flash sale item ด้วย productId (ซึ่งคือ Product.id)
      const item = await tx.flashSaleItem.findUnique({
        where: { productId },
        select: { id: true, stock: true, reserved: true },
      });

      if (!item) {
        // ✅ ทำให้ชัดว่ามันหาไม่เจอจริง (ไม่ใช่เงียบ)
        throw new BadRequestException("flash sale item not found");
      }

      // 2) atomic update กัน oversell
      // NOTE: ใช้ WHERE id + condition (stock - reserved >= qty) เพื่อกัน race condition
      const updatedRows = await tx.$queryRaw<
        Array<{ id: string; stock: number; reserved: number }>
      >`
        UPDATE "FlashSaleItem"
        SET "reserved" = "reserved" + ${qty}
        WHERE "id" = ${item.id}
          AND ("stock" - "reserved") >= ${qty}
        RETURNING "id", "stock", "reserved";
      `;

      if (updatedRows.length === 0) {
        throw new BadRequestException("sold out / not enough stock");
      }

      // 3) สร้าง reservation record
      return tx.reservation.create({
        data: {
          flashSaleItemId: item.id,
          qty,
          status: ReservationStatus.ACTIVE,
          expiresAt,
          requestId: requestId ?? null,
        },
        select: {
          id: true,
          flashSaleItemId: true,
          qty: true,
          status: true,
          expiresAt: true,
          createdAt: true,
        },
      });
    });
  }

  // ✅ debug: ดูสถานะ item แบบชัด (ถ้าไม่เจอให้ 404)
  async getItem(productId: string) {
    if (!productId || typeof productId !== "string") {
      throw new BadRequestException("productId is required");
    }

    const item = await this.prisma.flashSaleItem.findUnique({
      where: { productId },
      select: {
        id: true,
        productId: true,
        stock: true,
        reserved: true,
        sold: true,
        startsAt: true,
        endsAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!item) throw new NotFoundException("flash sale item not found");
    return item;
  }

  // ✅ debug: list items เพื่อเช็คว่า API เห็น DB อะไรอยู่จริง (แก้ปัญหา not found ได้ใน 1 นาที)
  async debugListItems() {
    return this.prisma.flashSaleItem.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productId: true,
        stock: true,
        reserved: true,
        sold: true,
        startsAt: true,
        endsAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ✅ debug: ดูรายการ reservations (ACTIVE = ยังไม่หมดอายุจริง ๆ)
  async listReservations(productId: string, mode: "ACTIVE" | "ALL" = "ACTIVE") {
    if (!productId || typeof productId !== "string") {
      throw new BadRequestException("productId is required");
    }

    const item = await this.prisma.flashSaleItem.findUnique({
      where: { productId },
      select: { id: true },
    });
    if (!item) throw new NotFoundException("flash sale item not found");

    const now = new Date();

    return this.prisma.reservation.findMany({
      where:
        mode === "ALL"
          ? { flashSaleItemId: item.id }
          : {
              flashSaleItemId: item.id,
              status: ReservationStatus.ACTIVE,
              expiresAt: { gt: now },
            },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        flashSaleItemId: true,
        qty: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }
}
