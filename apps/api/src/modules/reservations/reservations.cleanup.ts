import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ReservationsCleanup {
  private readonly logger = new Logger(ReservationsCleanup.name);

  constructor(private readonly prisma: PrismaService) {}

  // dev: ทุก 10 วินาที (โปรดักชันค่อยขยับเป็นทุก 30s/1m)
  @Cron("*/10 * * * * *")
  async releaseExpired() {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const expired = await tx.reservation.findMany({
        where: { status: "ACTIVE", expiresAt: { lte: now } },
        select: { id: true, flashSaleItemId: true, qty: true },
        take: 200,
      });

      if (expired.length === 0) return;

      for (const r of expired) {
        // คืน reserved
        await tx.flashSaleItem.update({
          where: { id: r.flashSaleItemId },
          data: { reserved: { decrement: r.qty } },
        });

        // mark expired
        await tx.reservation.update({
          where: { id: r.id },
          data: { status: "EXPIRED" },
        });
      }

      this.logger.log(`Released ${expired.length} expired reservations`);
    });
  }
}
