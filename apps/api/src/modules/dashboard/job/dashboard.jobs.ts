import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

type OrderAggRow = { grossCents: number; ordersCount: number };
type ItemsAggRow = { itemsSold: number };
type TopRow = { productId: string; qtySold: number; revenueCents: number };
type LockRow = { ok: boolean };

@Injectable()
export class DashboardJobs implements OnModuleInit {
  private readonly logger = new Logger(DashboardJobs.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * ✅ Warm start ตอนบูท
   * - ทำภายใต้ advisory lock เพื่อกันชนกับ cron / instance อื่น
   */
  async onModuleInit() {
    await this.withAdvisoryLock("dash_warm_start", async () => {
      try {
        const today = this.utcDayStart(new Date());
        const yesterday = this.addUtcDays(today, -1);

        // daily: วันนี้ + เมื่อวาน
        await this.computeDaily(today);
        await this.computeDaily(yesterday);

        // top: snapshot ของวันนี้
        await this.computeTop(today, "D7", 7, 50);
        await this.computeTop(today, "D30", 30, 50);

        this.logger.log("Dashboard jobs warm-start completed");
      } catch (e) {
        this.logger.error("Dashboard jobs warm-start failed", e as any);
      }
    });
  }

  // ✅ โปรดักชัน: EVERY_MINUTE (daily) + EVERY_HOUR (top)
  @Cron(CronExpression.EVERY_MINUTE)
  async refreshDailySales() {
    await this.withAdvisoryLock("dash_daily", async () => {
      const today = this.utcDayStart(new Date());
      const yesterday = this.addUtcDays(today, -1);

      await this.computeDaily(today);
      await this.computeDaily(yesterday);
    });
  }

  // ✅ โปรดักชันควรเป็น EVERY_HOUR
  @Cron(CronExpression.EVERY_HOUR)
  async refreshTopProducts() {
    await this.withAdvisoryLock("dash_top", async () => {
      const today = this.utcDayStart(new Date());
      await this.computeTop(today, "D7", 7, 50);
      await this.computeTop(today, "D30", 30, 50);
    });
  }

  // ---------- core compute ----------
  private async computeDaily(day: Date): Promise<void> {
    const dayStart = this.utcDayStart(day);
    const dayEnd = this.addUtcDays(dayStart, 1);

    // 1) gross + ordersCount จาก Order โดยตรง (กัน double count จาก join)
    const orderAgg = await this.prisma.$queryRaw<OrderAggRow[]>`
      SELECT
        COALESCE(SUM(o."totalCents"), 0)::int AS "grossCents",
        COUNT(*)::int AS "ordersCount"
      FROM "Order" o
      WHERE o.status = 'PAID'
        AND o."paidAt" >= ${dayStart}
        AND o."paidAt" < ${dayEnd};
    `;

    // 2) itemsSold จาก OrderItem join Order
    const itemAgg = await this.prisma.$queryRaw<ItemsAggRow[]>`
      SELECT
        COALESCE(SUM(oi.qty), 0)::int AS "itemsSold"
      FROM "OrderItem" oi
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o.status = 'PAID'
        AND o."paidAt" >= ${dayStart}
        AND o."paidAt" < ${dayEnd};
    `;

    const grossCents = orderAgg?.[0]?.grossCents ?? 0;
    const ordersCount = orderAgg?.[0]?.ordersCount ?? 0;
    const itemsSold = itemAgg?.[0]?.itemsSold ?? 0;

    await this.prisma.dailySales.upsert({
      where: { date: dayStart },
      update: { grossCents, ordersCount, itemsSold },
      create: { date: dayStart, grossCents, ordersCount, itemsSold },
    });

    this.logger.log(
      `DailySales ${dayStart.toISOString().slice(0, 10)} updated`,
    );
  }

  private async computeTop(
    asOfDate: Date,
    window: "D7" | "D30",
    days: number,
    topN: number,
  ): Promise<void> {
    const asOf = this.utcDayStart(asOfDate);

    // รวม "วันนี้" ด้วย: < พรุ่งนี้ 00:00 (UTC)
    const toExclusive = this.addUtcDays(asOf, 1);

    // ย้อนหลัง days วัน (รวมวันนี้) => -(days - 1)
    const from = this.addUtcDays(asOf, -(days - 1));

    const rows = await this.prisma.$queryRaw<TopRow[]>`
      SELECT
        oi."productId" AS "productId",
        COALESCE(SUM(oi.qty), 0)::int AS "qtySold",
        COALESCE(SUM(oi."lineTotalCents"), 0)::int AS "revenueCents"
      FROM "Order" o
      JOIN "OrderItem" oi ON oi."orderId" = o.id
      WHERE o.status = 'PAID'
        AND o."paidAt" >= ${from}
        AND o."paidAt" < ${toExclusive}
      GROUP BY oi."productId"
      ORDER BY "revenueCents" DESC, "qtySold" DESC
      LIMIT ${topN};
    `;

    await this.prisma.$transaction(async (tx) => {
      await tx.topProduct.deleteMany({ where: { window, asOfDate: asOf } });

      if (rows.length > 0) {
        await tx.topProduct.createMany({
          data: rows.map((r, i) => ({
            window,
            asOfDate: asOf,
            productId: r.productId,
            qtySold: r.qtySold,
            revenueCents: r.revenueCents,
            rank: i + 1,
          })),
        });
      }
    });

    this.logger.log(
      `TopProduct ${window} @ ${asOf.toISOString().slice(0, 10)} updated (${rows.length})`,
    );
  }

  // ---------- advisory lock ----------
  private async withAdvisoryLock(lockKey: string, fn: () => Promise<void>) {
    // ✅ ทำเป็น bigint เพื่อให้ตรงกับ pg_try_advisory_lock(bigint)
    const key = BigInt(this.hashToInt32(lockKey));

    const got = await this.prisma.$queryRaw<LockRow[]>(
      Prisma.sql`SELECT pg_try_advisory_lock(${key}) AS "ok";`,
    );

    if (!got?.[0]?.ok) {
      this.logger.warn(`Skip job, lock busy: ${lockKey}`);
      return;
    }

    try {
      await fn();
    } finally {
      try {
        await this.prisma.$queryRaw(
          Prisma.sql`SELECT pg_advisory_unlock(${key});`,
        );
      } catch (e) {
        this.logger.error(`Unlock failed: ${lockKey}`, e as any);
      }
    }
  }

  private hashToInt32(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  // ---------- UTC date helpers ----------
  private utcDayStart(d: Date) {
    const x = new Date(d);
    x.setUTCHours(0, 0, 0, 0);
    return x;
  }

  private addUtcDays(d: Date, days: number) {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() + days);
    return x;
  }
}
