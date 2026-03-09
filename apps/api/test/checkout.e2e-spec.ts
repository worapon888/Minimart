import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { randomUUID } from "crypto";
import { AppModule } from "../src/app.module";
import { prisma, resetDb, ensureTestProduct } from "./_helpers";
import { teardownApp } from "./_e2e";

type ReservationStatus = "ACTIVE" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

async function createReservation(params?: {
  qty?: number;
  status?: ReservationStatus;
  expiresAtMsFromNow?: number;
}) {
  const product = await ensureTestProduct();

  const fsi = await prisma.flashSaleItem.findUnique({
    where: { productId: product.id },
    select: { id: true },
  });
  if (!fsi) throw new Error("Missing flashSaleItem baseline for test product");

  const qty = params?.qty ?? 1;
  const status = params?.status ?? "ACTIVE";
  const expiresAtMsFromNow = params?.expiresAtMsFromNow ?? 5 * 60 * 1000;

  // ✅ ตรงนี้แก้ชื่อ field ให้ตรง schema Reservation ของคุณ (ถ้าจำเป็น)
  const reservation = await prisma.reservation.create({
    data: {
      flashSaleItemId: fsi.id,
      qty,
      status,
      expiresAt: new Date(Date.now() + expiresAtMsFromNow),
    } as any,
    select: {
      id: true,
      qty: true,
      status: true,
      expiresAt: true,
      flashSaleItemId: true,
    } as any,
  });

  return { product, reservation };
}

describe("checkout (e2e)", () => {
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

  describe("POST /checkout/start", () => {
    it("สร้าง Order(PENDING) + OrderItem ถูกต้อง และคืน {orderId,status}", async () => {
      const { product, reservation } = await createReservation({ qty: 2 });
      const idem = `chk_${randomUUID()}`;

      const res = await request(app.getHttpServer())
        .post("/checkout/start")
        .send({ reservationId: reservation.id, idempotencyKey: idem })
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          status: "PENDING",
          orderId: expect.any(String),
        }),
      );

      const orderId = res.body.orderId as string;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      expect(order).toBeTruthy();
      expect(order!.status).toBe("PENDING");
      expect(order!.reservationId).toBe(reservation.id);
      expect(order!.idempotencyKey).toBe(idem);

      // totals
      const expectedTotal = product.priceCents * 2;
      expect(order!.subtotalCents).toBe(expectedTotal);
      expect(order!.totalCents).toBe(expectedTotal);

      // items
      expect(order!.items).toHaveLength(1);
      expect(order!.items[0]).toEqual(
        expect.objectContaining({
          productId: product.id,
          qty: 2,
          unitPriceCents: product.priceCents,
          lineTotalCents: expectedTotal,
        }),
      );
    });

    it("idempotencyKey เดิมยิงซ้ำ: ต้องได้ orderId เดิม และไม่สร้าง Order เพิ่ม", async () => {
      const { reservation } = await createReservation({ qty: 1 });
      const idem = `chk_${randomUUID()}`;

      const r1 = await request(app.getHttpServer())
        .post("/checkout/start")
        .send({ reservationId: reservation.id, idempotencyKey: idem })
        .expect(201);

      const r2 = await request(app.getHttpServer())
        .post("/checkout/start")
        .send({ reservationId: reservation.id, idempotencyKey: idem })
        .expect(201);

      expect(r2.body.orderId).toBe(r1.body.orderId);

      const count = await prisma.order.count({
        where: { idempotencyKey: idem },
      });
      expect(count).toBe(1);
    });

    it("ไม่มี idempotencyKey ยิงซ้ำ: ครั้งที่ 2 ต้อง 409", async () => {
      const { reservation } = await createReservation({ qty: 1 });

      await request(app.getHttpServer())
        .post("/checkout/start")
        .send({ reservationId: reservation.id })
        .expect(201);

      await request(app.getHttpServer())
        .post("/checkout/start")
        .send({ reservationId: reservation.id })
        .expect(409);
    });

    it("reservation expired: ต้อง 400", async () => {
      const { reservation } = await createReservation({
        expiresAtMsFromNow: -1000,
      });

      await request(app.getHttpServer())
        .post("/checkout/start")
        .send({
          reservationId: reservation.id,
          idempotencyKey: `chk_${randomUUID()}`,
        })
        .expect(400);
    });

    it("dto validation: idempotencyKey ต้องยาว >= 8 และ forbid extra props", async () => {
      const { reservation } = await createReservation();

      await request(app.getHttpServer())
        .post("/checkout/start")
        .send({ reservationId: reservation.id, idempotencyKey: "short" })
        .expect(400);

      await request(app.getHttpServer())
        .post("/checkout/start")
        .send({
          reservationId: reservation.id,
          idempotencyKey: `chk_${randomUUID()}`,
          hacker: "x",
        })
        .expect(400);
    });
  });

  describe("POST /checkout/:orderId/pay", () => {
    it("สร้าง payment intent ให้ order และคืน {orderId, paymentIntentId, clientSecret}", async () => {
      const { reservation } = await createReservation({ qty: 1 });

      const start = await request(app.getHttpServer())
        .post("/checkout/start")
        .send({
          reservationId: reservation.id,
          idempotencyKey: `chk_${randomUUID()}`,
        })
        .expect(201);

      const orderId = start.body.orderId as string;

      const pay1 = await request(app.getHttpServer())
        .post(`/checkout/${orderId}/pay`)
        .send({ idempotencyKey: `pay_${randomUUID()}`, paymentMethod: "card" })
        .expect(201);

      expect(pay1.body).toEqual(
        expect.objectContaining({
          orderId,
          paymentIntentId: expect.any(String),
          clientSecret: expect.any(String),
        }),
      );

      expect(await prisma.paymentIntent.count()).toBe(1);
    });

    it("idempotency pay: key เดิมยิงซ้ำ ต้องได้ intent เดิม และไม่สร้างซ้ำ", async () => {
      const { reservation } = await createReservation({ qty: 1 });

      const start = await request(app.getHttpServer())
        .post("/checkout/start")
        .send({
          reservationId: reservation.id,
          idempotencyKey: `chk_${randomUUID()}`,
        })
        .expect(201);

      const orderId = start.body.orderId as string;
      const idemPay = `pay_${randomUUID()}`;

      const p1 = await request(app.getHttpServer())
        .post(`/checkout/${orderId}/pay`)
        .send({ idempotencyKey: idemPay, paymentMethod: "card" })
        .expect(201);

      const p2 = await request(app.getHttpServer())
        .post(`/checkout/${orderId}/pay`)
        .send({ idempotencyKey: idemPay, paymentMethod: "card" })
        .expect(201);

      expect(p2.body.paymentIntentId).toBe(p1.body.paymentIntentId);
      expect(p2.body.clientSecret).toBe(p1.body.clientSecret);
      expect(await prisma.paymentIntent.count()).toBe(1);
    });

    it("pay dto validation: idempotencyKey ต้องยาว >= 8", async () => {
      const { reservation } = await createReservation();

      const start = await request(app.getHttpServer())
        .post("/checkout/start")
        .send({
          reservationId: reservation.id,
          idempotencyKey: `chk_${randomUUID()}`,
        })
        .expect(201);

      const orderId = start.body.orderId as string;

      await request(app.getHttpServer())
        .post(`/checkout/${orderId}/pay`)
        .send({ idempotencyKey: "short", paymentMethod: "card" })
        .expect(400);
    });
  });
});
