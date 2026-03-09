// test/flashsale-concurrency.e2e-spec.ts
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { prisma, resetDb, ensureTestProduct } from "./_helpers";
import { teardownApp } from "./_e2e";

describe("flashsale concurrency (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    jest.setTimeout(20000);

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

  it("ยิง reserve พร้อมกันหลายครั้ง -> success ต้องไม่เกิน stock (availability = stock - reserved)", async () => {
    const product = await ensureTestProduct();

    // ตั้ง stock = 2 ชัด ๆ
    await prisma.flashSaleItem.update({
      where: { productId: product.id },
      data: { stock: 2, reserved: 0, sold: 0 },
    });

    // ยิงพร้อมกัน 5 ครั้ง แต่ stock มีแค่ 2 => success ต้องได้ 2
    const N = 5;

    const results = await Promise.allSettled(
      Array.from({ length: N }).map(() =>
        request(app.getHttpServer())
          .post(`/flashsale/${product.id}/reserve`)
          .send({ qty: 1 }),
      ),
    );

    const ok = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).status === 201,
    ).length;

    const fail = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).status !== 201,
    ).length;

    // ✅ ต้องสำเร็จไม่เกิน stock
    expect(ok).toBe(2);
    expect(ok + fail).toBe(N);

    const item = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
      select: { stock: true, reserved: true, sold: true },
    });

    expect(item).toBeTruthy();

    // ✅ reserved ต้องเท่ากับจำนวนที่จองสำเร็จ
    expect(item!.reserved).toBe(2);

    // ✅ stock "ไม่ถูกหัก" ตามดีไซน์ของคุณ
    expect(item!.stock).toBe(2);

    // ✅ sold ยังไม่ควรเพิ่ม (ยังไม่ได้จ่ายเงิน)
    expect(item!.sold).toBe(0);

    // ✅ availability ต้องเหลือ 0
    expect(item!.stock - item!.reserved).toBe(0);
  });
});
