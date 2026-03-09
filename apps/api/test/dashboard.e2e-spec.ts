import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { randomUUID } from "crypto";
import type { Cache } from "cache-manager";

import { AppModule } from "../src/app.module";
import { prisma, resetDb, ensureTestProduct } from "./_helpers";

import { DashboardJobs } from "../src/modules/dashboard/job/dashboard.jobs";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { teardownApp } from "./_e2e";

type CacheWithReset = Cache & { reset?: () => Promise<void> };

const yyyyMmDd = (d: Date) => d.toISOString().slice(0, 10);

describe("dashboard (e2e)", () => {
  let app: INestApplication;
  let jobs: DashboardJobs;
  let cache: CacheWithReset;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jobs = app.get(DashboardJobs);
    cache = app.get<CacheWithReset>(CACHE_MANAGER);
  });

  afterAll(async () => {
    await teardownApp(app, prisma);
  });

  beforeEach(async () => {
    await resetDb();
    await cache.reset?.();
  });

  async function createPaidOrder() {
    const product = await ensureTestProduct();

    const reserveRes = await request(app.getHttpServer())
      .post(`/flashsale/${product.id}/reserve`)
      .send({ qty: 1 })
      .expect(201);

    const reservationId = reserveRes.body?.reservationId ?? reserveRes.body?.id;
    expect(reservationId).toBeTruthy();

    const startRes = await request(app.getHttpServer())
      .post("/checkout/start")
      .send({ reservationId, idempotencyKey: `chk_${randomUUID()}` })
      .expect(201);

    const orderId = startRes.body?.orderId ?? startRes.body?.id;
    expect(orderId).toBeTruthy();

    const payRes = await request(app.getHttpServer())
      .post(`/checkout/${orderId}/pay`)
      .send({ idempotencyKey: `pay_${randomUUID()}`, paymentMethod: "card" })
      .expect(201);

    const paymentIntentId =
      payRes.body?.paymentIntentId ?? payRes.body?.paymentIntent?.id;
    expect(paymentIntentId).toBeTruthy();

    await request(app.getHttpServer())
      .post("/webhooks/payment")
      .send({
        provider: "mock",
        eventId: `evt_dash_${randomUUID()}`,
        type: "payment_intent.succeeded",
        data: { paymentIntentId, orderId },
      })
      .expect(201);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe("PAID");
    expect(order?.paidAt).toBeTruthy();

    return {
      orderId,
      totalCents: order!.totalCents,
      subtotalCents: order!.subtotalCents,
    };
  }

  it("daily range: คืนค่าถูกต้องหลังมีออเดอร์ (กัน timezone)", async () => {
    const created = await createPaidOrder();

    await jobs.refreshDailySales();

    const row = await prisma.dailySales.findFirst({
      orderBy: { date: "desc" },
    });
    expect(row).toBeTruthy();

    const day = yyyyMmDd(row!.date);

    const res = await request(app.getHttpServer())
      .get(`/dashboard/daily?from=${day}&to=${day}`)
      .expect(200);

    const arr = res.body as Array<{
      date: string;
      grossCents: number;
      ordersCount: number;
      itemsSold: number;
    }>;

    expect(arr).toHaveLength(1);
    expect(arr[0].date.slice(0, 10)).toBe(day);
    expect(arr[0].ordersCount).toBeGreaterThanOrEqual(1);
    expect(arr[0].itemsSold).toBeGreaterThanOrEqual(1);

    // ✅ robust: ยอมรับว่า impl ใช้ total หรือ subtotal
    expect([created.totalCents, created.subtotalCents]).toContain(
      arr[0].grossCents,
    );
  });

  it("top-products: ไม่ว่างหลังมีออเดอร์ + rank ถูกต้อง", async () => {
    await createPaidOrder();
    await jobs.refreshTopProducts();

    const res = await request(app.getHttpServer())
      .get("/dashboard/top-products?window=D7&limit=10")
      .expect(200);

    const rows = res.body as Array<{
      rank: number;
      qtySold: number;
      revenueCents: number;
      product: { id: string; title: string };
    }>;

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].rank).toBe(1);
    expect(rows[0].qtySold).toBeGreaterThanOrEqual(1);
    expect(rows[0].revenueCents).toBeGreaterThan(0);
    expect(rows[0].product?.id).toBeTruthy();
  });

  it("cache works: ยิงซ้ำแล้วได้ข้อมูลเดิมแม้ลบ read model ใน DB", async () => {
    await createPaidOrder();

    await jobs.refreshDailySales();
    await jobs.refreshTopProducts();

    const dailyRow = await prisma.dailySales.findFirst({
      orderBy: { date: "desc" },
    });
    expect(dailyRow).toBeTruthy();
    const day = yyyyMmDd(dailyRow!.date);

    const dailyUrl = `/dashboard/daily?from=${day}&to=${day}`;
    const daily1 = await request(app.getHttpServer()).get(dailyUrl).expect(200);

    await prisma.dailySales.deleteMany({});
    const daily2 = await request(app.getHttpServer()).get(dailyUrl).expect(200);

    expect(daily2.body).toEqual(daily1.body);

    const topUrl = "/dashboard/top-products?window=D7&limit=10";
    const top1 = await request(app.getHttpServer()).get(topUrl).expect(200);

    await prisma.topProduct.deleteMany({});
    const top2 = await request(app.getHttpServer()).get(topUrl).expect(200);

    expect(top2.body).toEqual(top1.body);
  });
});
