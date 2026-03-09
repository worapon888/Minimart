import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import type { Cache } from "cache-manager";
import { PrismaService } from "../../prisma/prisma.service";
import { dashKey } from "./dashboard.cache";
import { TopWindowDto } from "./dto/dashboard.dto";

type DailyRow = {
  date: Date;
  grossCents: number;
  ordersCount: number;
  itemsSold: number;
};

type TopRow = {
  rank: number;
  qtySold: number;
  revenueCents: number;
  product: {
    id: string;
    title: string;
    priceCents: number;
    thumbnail: string | null;
    imageUrl: string | null;
  };
};

type TopAggRow = { productId: string; qtySold: number; revenueCents: number };
type OrderAggRow = { grossCents: number; ordersCount: number };
type ItemsAggRow = { itemsSold: number };
type ProductListRow = {
  id: string;
  sku: string;
  title: string;
  category: string | null;
  priceCents: number;
  status: string;
  createdAt: Date;
  thumbnail: string | null;
  imageUrl: string | null;
  inventory: { onHand: number; reserved: number } | null;
  flashSaleItem: { stock: number; reserved: number; sold: number } | null;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async getDailyRange(from: Date, to: Date): Promise<DailyRow[]> {
    const f = this.toUtcDayStart(from);
    const t = this.toUtcDayStart(to);

    // inclusive -> exclusive end
    const endExclusive = this.addUtcDays(t, 1);

    // guard: กันช่วงกลับหัว / input เพี้ยน
    if (endExclusive.getTime() < f.getTime()) {
      throw new BadRequestException("Invalid range: to must be >= from");
    }

    const key = dashKey.dailyRange(
      f.toISOString().slice(0, 10),
      t.toISOString().slice(0, 10),
    );

    const cached = (await this.cache.get<DailyRow[]>(key)) ?? null;
    if (cached) return cached;

    const data = await this.prisma.dailySales.findMany({
      where: { date: { gte: f, lt: endExclusive } },
      orderBy: { date: "asc" },
      select: {
        date: true,
        grossCents: true,
        ordersCount: true,
        itemsSold: true,
      },
    });

    await this.cache.set(key, data, this.ttlSeconds());
    return data;
  }

  async getTopProducts(window: TopWindowDto, limit = 10): Promise<TopRow[]> {
    const lim = this.clampInt(limit, 1, 50);
    if (window !== "D7" && window !== "D30") {
      throw new BadRequestException("Invalid window (expected D7 or D30)");
    }

    const today = this.toUtcDayStart(new Date());

    // เอา asOfDate ล่าสุดจริงจาก DB ก่อน (ไม่เดา) + normalize เป็น day start
    const meta = await this.prisma.topProduct.findFirst({
      where: { window },
      orderBy: { asOfDate: "desc" },
      select: { asOfDate: true },
    });

    const asOf = meta?.asOfDate ? this.toUtcDayStart(meta.asOfDate) : today;

    const key = dashKey.top(window, asOf.toISOString().slice(0, 10), lim);
    const cached = (await this.cache.get<TopRow[]>(key)) ?? null;
    if (cached) return cached;

    let rows = await this.prisma.topProduct.findMany({
      where: { window, asOfDate: asOf, rank: { lte: lim } },
      orderBy: { rank: "asc" },
      select: {
        rank: true,
        qtySold: true,
        revenueCents: true,
        product: {
          select: {
            id: true,
            title: true,
            priceCents: true,
            thumbnail: true,
            imageUrl: true,
          },
        },
      },
    });

    // ถ้าว่าง -> build snapshot วันนี้ทันที (เพื่อให้ e2e / local dev ไม่ต้องรอ cron)
    if (rows.length === 0) {
      await this.computeTopOnDemand(today, window, lim);

      rows = await this.prisma.topProduct.findMany({
        where: { window, asOfDate: today, rank: { lte: lim } },
        orderBy: { rank: "asc" },
        select: {
          rank: true,
          qtySold: true,
          revenueCents: true,
          product: {
            select: {
              id: true,
              title: true,
              priceCents: true,
              thumbnail: true,
              imageUrl: true,
            },
          },
        },
      });
    }

    await this.cache.set(key, rows, this.ttlSeconds());
    return rows;
  }

  async seedSamplePaidOrders(count = 2) {
    const qty = this.clampInt(count, 1, 10);
    const products = await this.prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      take: Math.max(2, qty),
      select: { id: true, title: true, priceCents: true },
    });

    if (products.length === 0) {
      throw new BadRequestException("No active products found for demo seed");
    }

    const now = new Date();
    for (let i = 0; i < qty; i++) {
      const p = products[i % products.length];
      const itemQty = i % 2 === 0 ? 1 : 2;
      const subtotalCents = p.priceCents * itemQty;

      await this.prisma.order.create({
        data: {
          status: "PAID",
          paidAt: new Date(now.getTime() - i * 60 * 1000),
          currency: "USD",
          subtotalCents,
          totalCents: subtotalCents,
          items: {
            create: {
              productId: p.id,
              qty: itemQty,
              unitPriceCents: p.priceCents,
              lineTotalCents: subtotalCents,
            },
          },
        },
      });
    }

    await this.refreshDashboardReadModelsForToday();
    await this.clearDashboardCache();

    return { ok: true, createdOrders: qty };
  }

  async cleanupSamplePaidOrders(count = 2) {
    const qty = this.clampInt(count, 1, 10);
    const candidates = await this.prisma.order.findMany({
      where: {
        status: "PAID",
        reservationId: null,
        userId: null,
        idempotencyKey: null,
        paymentIntent: null,
      },
      orderBy: { createdAt: "desc" },
      take: qty,
      select: { id: true },
    });

    const ids = candidates.map((x) => x.id);
    const deleted =
      ids.length > 0
        ? await this.prisma.order.deleteMany({ where: { id: { in: ids } } })
        : { count: 0 };

    await this.refreshDashboardReadModelsForToday();
    await this.clearDashboardCache();

    return { ok: true, deletedOrders: deleted.count };
  }

  async listOrders(limit = 50, offset = 0) {
    const lim = this.clampInt(limit, 1, 200);
    const off = this.clampInt(offset, 0, 1_000_000);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.order.count(),
      this.prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        skip: off,
        take: lim,
        select: {
          id: true,
          status: true,
          currency: true,
          subtotalCents: true,
          totalCents: true,
          createdAt: true,
          paidAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          items: {
            select: {
              qty: true,
            },
          },
        },
      }),
    ]);

    const data = rows.map((row) => ({
      id: row.id,
      status: row.status,
      currency: row.currency,
      subtotalCents: row.subtotalCents,
      totalCents: row.totalCents,
      createdAt: row.createdAt,
      paidAt: row.paidAt,
      itemCount: row.items.reduce((sum, i) => sum + i.qty, 0),
      user: row.user,
    }));

    return {
      ok: true,
      meta: { total, limit: lim, offset: off },
      data,
    };
  }

  async listInventory(limit = 50, offset = 0) {
    const lim = this.clampInt(limit, 1, 200);
    const off = this.clampInt(offset, 0, 1_000_000);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        skip: off,
        take: lim,
        select: {
          id: true,
          sku: true,
          title: true,
          category: true,
          priceCents: true,
          status: true,
          createdAt: true,
          thumbnail: true,
          imageUrl: true,
          inventory: {
            select: {
              onHand: true,
              reserved: true,
            },
          },
          flashSaleItem: {
            select: {
              stock: true,
              reserved: true,
              sold: true,
            },
          },
        },
      }),
    ]);

    const data = (rows as ProductListRow[]).map((row) => {
      const invOnHand = row.inventory?.onHand ?? 0;
      const invReserved = row.inventory?.reserved ?? 0;
      const flashStock = row.flashSaleItem?.stock ?? 0;
      const flashReserved = row.flashSaleItem?.reserved ?? 0;
      const flashSold = row.flashSaleItem?.sold ?? 0;

      return {
        id: row.id,
        sku: row.sku,
        title: row.title,
        category: row.category,
        priceCents: row.priceCents,
        status: row.status,
        createdAt: row.createdAt,
        thumbnail: row.thumbnail,
        imageUrl: row.imageUrl,
        onHand: invOnHand,
        reserved: invReserved,
        available: Math.max(invOnHand - invReserved, 0),
        flashStock,
        flashReserved,
        flashSold,
      };
    });

    return {
      ok: true,
      meta: { total, limit: lim, offset: off },
      data,
    };
  }

  async listCustomers(limit = 50, offset = 0) {
    const lim = this.clampInt(limit, 1, 200);
    const off = this.clampInt(offset, 0, 1_000_000);

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip: off,
        take: lim,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          orders: {
            select: {
              status: true,
              totalCents: true,
              createdAt: true,
              paidAt: true,
            },
          },
        },
      }),
    ]);

    const data = users.map((u) => {
      const paidOrders = u.orders.filter((o) => o.status === "PAID");
      const totalSpentCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);
      const lastOrderAt = [...u.orders]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        ?.createdAt;

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        ordersCount: u.orders.length,
        paidOrdersCount: paidOrders.length,
        totalSpentCents,
        lastOrderAt: lastOrderAt ?? null,
      };
    });

    return {
      ok: true,
      meta: { total, limit: lim, offset: off },
      data,
    };
  }

  async getReportSummary(days = 30) {
    const d = this.clampInt(days, 7, 90);
    const today = this.toUtcDayStart(new Date());
    const from = this.addUtcDays(today, -(d - 1));

    const daily = await this.getDailyRange(from, today);
    const totalRevenueCents = daily.reduce((sum, r) => sum + r.grossCents, 0);
    const totalOrders = daily.reduce((sum, r) => sum + r.ordersCount, 0);
    const totalItems = daily.reduce((sum, r) => sum + r.itemsSold, 0);
    const avgOrderValueCents =
      totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

    const topWindow = d <= 7 ? TopWindowDto.D7 : TopWindowDto.D30;
    const topProducts = await this.getTopProducts(topWindow, 5);

    return {
      ok: true,
      data: {
        days: d,
        totals: {
          revenueCents: totalRevenueCents,
          orders: totalOrders,
          items: totalItems,
          avgOrderValueCents,
        },
        daily,
        topProducts,
      },
    };
  }

  private async computeTopOnDemand(
    asOf: Date,
    window: "D7" | "D30",
    topN: number,
  ): Promise<void> {
    const days = window === "D7" ? 7 : 30;

    // asOf ต้องเป็น day start อยู่แล้ว (แต่ normalize กันพลาดอีกชั้น)
    const asOfDay = this.toUtcDayStart(asOf);

    const toExclusive = this.addUtcDays(asOfDay, 1);
    const from = this.addUtcDays(asOfDay, -(days - 1));

    // IMPORTANT: ใช้ tagged template เท่านั้น (Prisma ชอบแบบนี้ที่สุด)
    const rows = await this.prisma.$queryRaw<TopAggRow[]>`
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
      await tx.topProduct.deleteMany({
        where: { window, asOfDate: asOfDay },
      });

      if (rows.length > 0) {
        await tx.topProduct.createMany({
          data: rows.map((r, i) => ({
            window,
            asOfDate: asOfDay,
            productId: r.productId,
            qtySold: r.qtySold,
            revenueCents: r.revenueCents,
            rank: i + 1,
          })),
        });
      }
    });
  }

  private async refreshDashboardReadModelsForToday() {
    const today = this.toUtcDayStart(new Date());
    await this.computeDailyOnDemand(today);
    await this.computeTopOnDemand(today, "D7", 50);
    await this.computeTopOnDemand(today, "D30", 50);
  }

  private async computeDailyOnDemand(day: Date) {
    const dayStart = this.toUtcDayStart(day);
    const dayEnd = this.addUtcDays(dayStart, 1);

    const orderAgg = await this.prisma.$queryRaw<OrderAggRow[]>`
      SELECT
        COALESCE(SUM(o."totalCents"), 0)::int AS "grossCents",
        COUNT(*)::int AS "ordersCount"
      FROM "Order" o
      WHERE o.status = 'PAID'
        AND o."paidAt" >= ${dayStart}
        AND o."paidAt" < ${dayEnd};
    `;

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
  }

  private async clearDashboardCache() {
    const cacheAny = this.cache as Cache & { clear?: () => Promise<void> };
    await cacheAny.clear?.();
  }

  // ---------- TTL ----------
  // cache-manager expects ttl as seconds (number)
  // ใช้ ENV CACHE_TTL_MS ถ้ามี (ms) แล้วแปลงเป็น seconds
  private ttlSeconds(): number {
    const ms = Number(process.env.CACHE_TTL_MS ?? 30_000);
    if (!Number.isFinite(ms) || ms <= 0) return 30;
    return Math.max(1, Math.ceil(ms / 1000));
  }

  private clampInt(x: number, min: number, max: number): number {
    const n = Number(x);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, Math.trunc(n)));
  }

  // ---------- utils (UTC day boundary) ----------
  private toUtcDayStart(d: Date): Date {
    const x = new Date(d);
    x.setUTCHours(0, 0, 0, 0);
    return x;
  }

  private addUtcDays(d: Date, days: number): Date {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() + days);
    return x;
  }
}
