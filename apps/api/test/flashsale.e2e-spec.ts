import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { randomUUID } from "crypto";
import { AppModule } from "../src/app.module";
import { prisma, resetDb, ensureTestProduct } from "./_helpers";
import { teardownApp } from "./_e2e";

describe("flash sale flow (e2e)", () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await teardownApp(app, prisma);
  });

  beforeEach(async () => {
    await resetDb();
  });

  async function reserveStartPay() {
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

    const beforeItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
    });
    expect(beforeItem).toBeTruthy();

    return {
      product,
      reservationId,
      orderId,
      paymentIntentId,
      beforeItem: beforeItem!,
    };
  }

  it("webhook replay (eventId เดิม) -> dedupe และไม่ตัด stock ซ้ำ", async () => {
    const { product, reservationId, orderId, paymentIntentId, beforeItem } =
      await reserveStartPay();

    const eventId = `evt_dup_${randomUUID()}`;

    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .post("/webhooks/payment")
        .send({
          provider: "mock",
          eventId,
          type: "payment_intent.succeeded",
          data: { paymentIntentId, orderId },
        })
        .expect(201);
    }

    const orderAfter = await prisma.order.findUnique({
      where: { id: orderId },
    });
    expect(orderAfter?.status).toBe("PAID");
    expect(orderAfter?.paidAt).toBeTruthy();

    const webhookEvents = await prisma.webhookEvent.findMany({
      where: { provider: "mock", eventId },
    });
    expect(webhookEvents).toHaveLength(1);

    const reservationAfter = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    expect(reservationAfter?.status).toBe("CONFIRMED");

    const afterItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
    });
    expect(afterItem).toBeTruthy();

    expect(afterItem!.sold).toBe(beforeItem.sold + 1);
    expect(afterItem!.stock).toBe(beforeItem.stock - 1);
  });

  it("webhook คนละ eventId แต่ order เดิม -> event บันทึกได้หลายแถว แต่ห้าม commit stock ซ้ำ", async () => {
    const { product, reservationId, orderId, paymentIntentId, beforeItem } =
      await reserveStartPay();

    const eventIds = [
      `evt_${randomUUID()}`,
      `evt_${randomUUID()}`,
      `evt_${randomUUID()}`,
    ];

    for (const eid of eventIds) {
      await request(app.getHttpServer())
        .post("/webhooks/payment")
        .send({
          provider: "mock",
          eventId: eid,
          type: "payment_intent.succeeded",
          data: { paymentIntentId, orderId },
        })
        .expect(201);
    }

    const orderAfter = await prisma.order.findUnique({
      where: { id: orderId },
    });
    expect(orderAfter?.status).toBe("PAID");
    expect(orderAfter?.paidAt).toBeTruthy();

    const events = await prisma.webhookEvent.findMany({
      where: { provider: "mock", eventId: { in: eventIds } },
    });
    expect(events).toHaveLength(3);

    // ✅ 핵: commit ต้องเกิดครั้งเดียว (order transition idempotent)
    const afterItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
    });
    expect(afterItem).toBeTruthy();
    expect(afterItem!.sold).toBe(beforeItem.sold + 1);
    expect(afterItem!.stock).toBe(beforeItem.stock - 1);

    const reservationAfter = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    expect(reservationAfter?.status).toBe("CONFIRMED");
  });

  it("payment failed -> order CANCELED + ห้าม commit stock (และ eventId เดิมต้อง dedupe)", async () => {
    const product = await ensureTestProduct();
    const eventId = `evt_fail_${randomUUID()}`;

    const reserveRes = await request(app.getHttpServer())
      .post(`/flashsale/${product.id}/reserve`)
      .send({ qty: 1 })
      .expect(201);

    const reservationId = reserveRes.body?.reservationId ?? reserveRes.body?.id;
    expect(reservationId).toBeTruthy();

    const beforeItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
    });
    expect(beforeItem).toBeTruthy();

    const startRes = await request(app.getHttpServer())
      .post("/checkout/start")
      .send({ reservationId, idempotencyKey: `chk_fail_${randomUUID()}` })
      .expect(201);

    const orderId = startRes.body?.orderId ?? startRes.body?.id;
    expect(orderId).toBeTruthy();

    const payRes = await request(app.getHttpServer())
      .post(`/checkout/${orderId}/pay`)
      .send({
        idempotencyKey: `pay_fail_${randomUUID()}`,
        paymentMethod: "card",
      })
      .expect(201);

    const paymentIntentId =
      payRes.body?.paymentIntentId ?? payRes.body?.paymentIntent?.id;
    expect(paymentIntentId).toBeTruthy();

    for (let i = 0; i < 2; i++) {
      await request(app.getHttpServer())
        .post("/webhooks/payment")
        .send({
          provider: "mock",
          eventId,
          type: "payment_intent.failed",
          data: { paymentIntentId, orderId },
        })
        .expect(201);
    }

    const orderAfter = await prisma.order.findUnique({
      where: { id: orderId },
    });
    expect(orderAfter?.status).toBe("CANCELED");

    const events = await prisma.webhookEvent.findMany({
      where: { provider: "mock", eventId },
    });
    expect(events).toHaveLength(1);

    const reservationAfter = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    expect(reservationAfter?.status).not.toBe("CONFIRMED");

    const afterItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
    });
    expect(afterItem).toBeTruthy();
    expect(afterItem!.sold).toBe(beforeItem!.sold);
    expect(afterItem!.stock).toBe(beforeItem!.stock);
  });
});
