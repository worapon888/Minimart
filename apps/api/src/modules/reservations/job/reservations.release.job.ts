// apps/api/src/modules/reservations/job/reservations.release.job.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class ReservationsReleaseJob {
  private readonly logger = new Logger(ReservationsReleaseJob.name);
  private readonly BATCH = 500;

  constructor(private readonly prisma: PrismaService) {}

  @Cron("*/30 * * * * *")
  async cronReleaseExpired() {
    try {
      const res = await this.runOnce(new Date());
      if (res.released > 0) {
        this.logger.log(
          `Released ${res.released} expired reservations (items=${res.itemsTouched})`,
        );
      }
    } catch (err) {
      this.logger.error("releaseExpired failed", err as any);
    }
  }

  async runOnce(now: Date = new Date()): Promise<{
    released: number;
    itemsTouched: number;
  }> {
    // ✅ ใช้ transaction แบบ "batch SQL" ไม่ทำ loop ใน tx
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<
        Array<{ released: bigint; items_touched: bigint }>
      >`
        WITH picked AS (
          SELECT "id"
          FROM "Reservation"
          WHERE "status" = 'ACTIVE'
            AND "expiresAt" < ${now}
          ORDER BY "expiresAt" ASC
          LIMIT ${this.BATCH}
          FOR UPDATE SKIP LOCKED
        ),
        expired AS (
          UPDATE "Reservation" r
          SET "status" = 'EXPIRED'
          FROM picked
          WHERE r."id" = picked."id"
          RETURNING r."flashSaleItemId" AS item_id, r."qty" AS qty
        ),
        agg AS (
          SELECT item_id, SUM(qty)::int AS total_qty
          FROM expired
          GROUP BY item_id
        ),
        upd AS (
          UPDATE "FlashSaleItem" f
          SET "reserved" = GREATEST(f."reserved" - agg.total_qty, 0)
          FROM agg
          WHERE f."id" = agg.item_id
          RETURNING f."id"
        )
        SELECT
          (SELECT COUNT(*) FROM expired) AS released,
          (SELECT COUNT(*) FROM agg) AS items_touched;
      `;

      const released = Number(rows?.[0]?.released ?? 0);
      const itemsTouched = Number(rows?.[0]?.items_touched ?? 0);
      return { released, itemsTouched };
    });
  }
}
