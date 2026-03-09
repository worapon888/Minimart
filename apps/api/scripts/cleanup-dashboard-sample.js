const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const SAMPLE_COUNT = Number(process.argv[2] ?? 2);

function utcDayStart(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function addUtcDays(d, days) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

async function refreshDailySales(prisma, dayStart) {
  const dayEnd = addUtcDays(dayStart, 1);

  const orderAgg = await prisma.$queryRaw`
    SELECT
      COALESCE(SUM(o."totalCents"), 0)::int AS "grossCents",
      COUNT(*)::int AS "ordersCount"
    FROM "Order" o
    WHERE o.status = 'PAID'
      AND o."paidAt" >= ${dayStart}
      AND o."paidAt" < ${dayEnd};
  `;

  const itemAgg = await prisma.$queryRaw`
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

  await prisma.dailySales.upsert({
    where: { date: dayStart },
    update: { grossCents, ordersCount, itemsSold },
    create: { date: dayStart, grossCents, ordersCount, itemsSold },
  });
}

async function refreshTopProducts(prisma, asOfDate, window, days, topN = 50) {
  const toExclusive = addUtcDays(asOfDate, 1);
  const from = addUtcDays(asOfDate, -(days - 1));

  const rows = await prisma.$queryRaw`
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

  await prisma.$transaction(async (tx) => {
    await tx.topProduct.deleteMany({ where: { window, asOfDate } });
    if (rows.length === 0) return;

    await tx.topProduct.createMany({
      data: rows.map((r, i) => ({
        window,
        asOfDate,
        productId: r.productId,
        qtySold: r.qtySold,
        revenueCents: r.revenueCents,
        rank: i + 1,
      })),
    });
  });
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");

  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

  const count = Number.isFinite(SAMPLE_COUNT)
    ? Math.max(1, Math.min(50, Math.trunc(SAMPLE_COUNT)))
    : 2;

  try {
    // ลบเฉพาะ sample orders ที่สร้างแบบ direct insert:
    // - PAID
    // - ไม่มี reservation/user/idempotency/paymentIntent
    const candidates = await prisma.order.findMany({
      where: {
        status: "PAID",
        reservationId: null,
        userId: null,
        idempotencyKey: null,
        paymentIntent: null,
      },
      orderBy: { createdAt: "desc" },
      take: count,
      select: { id: true, totalCents: true, createdAt: true },
    });

    if (candidates.length === 0) {
      console.log("No sample orders matched cleanup condition.");
      return;
    }

    const ids = candidates.map((x) => x.id);
    const deleted = await prisma.order.deleteMany({ where: { id: { in: ids } } });

    console.log(`Deleted sample PAID orders: ${deleted.count}`);

    const today = utcDayStart(new Date());
    await refreshDailySales(prisma, today);
    await refreshTopProducts(prisma, today, "D7", 7, 50);
    await refreshTopProducts(prisma, today, "D30", 30, 50);

    const daily = await prisma.dailySales.findUnique({ where: { date: today } });
    const topCount = await prisma.topProduct.count({
      where: { asOfDate: today, window: "D30" },
    });

    console.log(
      `DailySales ${today.toISOString().slice(0, 10)} -> orders=${daily?.ordersCount ?? 0}, items=${daily?.itemsSold ?? 0}, gross=${(((daily?.grossCents ?? 0) / 100).toFixed(2))} USD`,
    );
    console.log(`TopProducts D30 rows: ${topCount}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Failed to cleanup sample paid orders:", e.message);
  process.exit(1);
});
