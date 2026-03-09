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
    ? Math.max(1, Math.min(10, Math.trunc(SAMPLE_COUNT)))
    : 2;

  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      take: Math.max(2, count),
      select: { id: true, title: true, priceCents: true },
    });

    if (products.length === 0) {
      throw new Error("No active products found. Seed products first.");
    }

    const now = new Date();
    let created = 0;

    for (let i = 0; i < count; i++) {
      const p = products[i % products.length];
      const qty = i % 2 === 0 ? 1 : 2;
      const subtotalCents = p.priceCents * qty;

      await prisma.order.create({
        data: {
          status: "PAID",
          paidAt: new Date(now.getTime() - i * 60 * 1000),
          currency: "USD",
          subtotalCents,
          totalCents: subtotalCents,
          items: {
            create: {
              productId: p.id,
              qty,
              unitPriceCents: p.priceCents,
              lineTotalCents: subtotalCents,
            },
          },
        },
      });

      created += 1;
      console.log(
        `Created PAID order #${created}: ${p.title} x${qty} (${(subtotalCents / 100).toFixed(2)} USD)`,
      );
    }

    const today = utcDayStart(new Date());
    await refreshDailySales(prisma, today);
    await refreshTopProducts(prisma, today, "D7", 7, 50);
    await refreshTopProducts(prisma, today, "D30", 30, 50);

    const daily = await prisma.dailySales.findUnique({ where: { date: today } });
    const top = await prisma.topProduct.findMany({
      where: { asOfDate: today, window: "D30" },
      orderBy: { rank: "asc" },
      take: 5,
      select: {
        rank: true,
        qtySold: true,
        revenueCents: true,
        product: { select: { title: true } },
      },
    });

    console.log("\nDashboard read models updated");
    console.log(
      `DailySales ${today.toISOString().slice(0, 10)} -> orders=${daily?.ordersCount ?? 0}, items=${daily?.itemsSold ?? 0}, gross=${(((daily?.grossCents ?? 0) / 100).toFixed(2))} USD`,
    );
    console.log("TopProducts D30:");
    for (const row of top) {
      console.log(
        `  #${row.rank} ${row.product.title} | qty=${row.qtySold} | revenue=${(row.revenueCents / 100).toFixed(2)} USD`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Failed to create sample paid orders:", e.message);
  process.exit(1);
});
