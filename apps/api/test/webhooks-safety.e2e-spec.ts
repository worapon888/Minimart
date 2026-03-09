import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { randomUUID } from "crypto";

import { AppModule } from "../src/app.module";
import { prisma, resetDb, ensureTestProduct } from "./_helpers";
import { teardownApp } from "./_e2e";

describe("webhooks safety (e2e)", () => {
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

  it("ยิง webhook succeeded ด้วย paymentIntentId ที่ไม่ตรง orderId -> ห้าม PAID และห้ามตัด stock", async () => {
    const product = await ensureTestProduct();

    // reserve -> start -> pay (ได้ paymentIntentId ของ order จริง)
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

    const realPaymentIntentId =
      payRes.body?.paymentIntentId ?? payRes.body?.paymentIntent?.id;
    expect(realPaymentIntentId).toBeTruthy();

    const beforeItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
    });
    expect(beforeItem).toBeTruthy();

    // สร้าง order อื่นเพื่อทำ "mapping mismatch"
    const reserve2 = await request(app.getHttpServer())
      .post(`/flashsale/${product.id}/reserve`)
      .send({ qty: 1 })
      .expect(201);

    const reservationId2 = reserve2.body?.reservationId ?? reserve2.body?.id;
    const start2 = await request(app.getHttpServer())
      .post("/checkout/start")
      .send({
        reservationId: reservationId2,
        idempotencyKey: `chk_${randomUUID()}`,
      })
      .expect(201);

    const otherOrderId = start2.body?.orderId ?? start2.body?.id;
    expect(otherOrderId).toBeTruthy();

    // ✅ ยิง webhook ให้ orderId = otherOrderId แต่ intentId = ของ orderId แรก (ผิด mapping)
    const eventId = `evt_bad_${randomUUID()}`;

    const wh = await request(app.getHttpServer())
      .post("/webhooks/payment")
      .send({
        provider: "mock",
        eventId,
        type: "payment_intent.succeeded",
        data: { paymentIntentId: realPaymentIntentId, orderId: otherOrderId },
      });

    // บาง implementation จะ 400, บางอันจะ 201 แต่ ignore
    expect([200, 201, 400]).toContain(wh.status);

    // ✅ orderId อื่นห้ามถูกทำให้ PAID
    const otherOrder = await prisma.order.findUnique({
      where: { id: otherOrderId },
    });
    expect(otherOrder).toBeTruthy();
    expect(otherOrder!.status).not.toBe("PAID");

    // ✅ ห้าม commit stock/sold เพิ่ม “จากการยิงมั่ว”
    const afterItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
    });
    expect(afterItem).toBeTruthy();
    expect(afterItem!.sold).toBe(beforeItem!.sold);
    expect(afterItem!.stock).toBe(beforeItem!.stock);
  });
});
