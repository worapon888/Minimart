// apps/api/src/modules/reservations/reservations.release.job.ts
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import { ReservationStatus } from "@prisma/client";

@Injectable()
export class ReservationsReleaseJob {
  constructor(private prisma: PrismaService) {}

  @Cron("*/30 * * * * *") // ทุก 30 วิ
  async releaseExpired() {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      // 1) เอาหมดอายุที่ยัง ACTIVE (จำกัดจำนวนกันล็อกนาน)
      const expired = await tx.reservation.findMany({
        where: {
          status: ReservationStatus.ACTIVE,
          expiresAt: { lt: now },
        },
        select: { id: true, flashSaleItemId: true, qty: true },
        take: 500,
      });

      if (expired.length === 0) return;

      // 2) group sum qty by item
      const byItem = new Map<string, number>();
      for (const r of expired) {
        byItem.set(
          r.flashSaleItemId,
          (byItem.get(r.flashSaleItemId) ?? 0) + r.qty,
        );
      }

      // 3) คืน reserved (กันติดลบด้วย GREATEST)
      for (const [itemId, totalQty] of byItem.entries()) {
        await tx.$queryRaw`
          UPDATE "FlashSaleItem"
          SET "reserved" = GREATEST("reserved" - ${totalQty}, 0)
          WHERE "id" = ${itemId};
        `;
      }

      // 4) mark expired
      await tx.reservation.updateMany({
        where: { id: { in: expired.map((x) => x.id) } },
        data: { status: ReservationStatus.EXPIRED },
      });
    });
  }
}
