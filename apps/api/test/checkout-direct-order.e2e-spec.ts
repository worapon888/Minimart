import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { randomUUID } from "crypto";
import { AppModule } from "../src/app.module";
import { prisma, resetDb, ensureTestProduct } from "./_helpers";
import { teardownApp } from "./_e2e";

describe("checkout direct order (e2e)", () => {
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

  it("creates order from /checkout/orders and persists items totals", async () => {
    const product = await ensureTestProduct();

    const res = await request(app.getHttpServer())
      .post("/checkout/orders")
      .send({
        idempotencyKey: `ord_${randomUUID()}`,
        items: [{ productId: product.id, qty: 2 }],
        shipping: {
          name: "E2E User",
          tel: "0812345678",
          address: "123 Test Street",
          email: "e2e@example.com",
        },
      })
      .expect(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        orderId: expect.any(String),
        status: "PENDING",
      }),
    );

    const order = await prisma.order.findUnique({
      where: { id: res.body.orderId },
      include: { items: true },
    });
    const expectedSubtotal = product.priceCents * 2;
    const expectedShipping = 299;

    expect(order).toBeTruthy();
    expect(order!.items).toHaveLength(1);
    expect(order!.subtotalCents).toBe(expectedSubtotal);
    expect(order!.totalCents).toBe(expectedSubtotal + expectedShipping);
  });

  it("rejects invalid direct-order payloads", async () => {
    const product = await ensureTestProduct();

    await request(app.getHttpServer())
      .post("/checkout/orders")
      .send({
        idempotencyKey: `ord_${randomUUID()}`,
        items: [],
        shipping: {
          name: "E2E User",
          tel: "0812345678",
          address: "123 Test Street",
        },
      })
      .expect(400);

    await request(app.getHttpServer())
      .post("/checkout/orders")
      .send({
        idempotencyKey: `ord_${randomUUID()}`,
        items: [{ productId: product.id, qty: 101 }],
        shipping: {
          name: "E2E User",
          tel: "bad-phone",
          address: "123 Test Street",
        },
      })
      .expect(400);
  });
});
