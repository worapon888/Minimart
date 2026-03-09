// test/reservations-ttl.e2e-spec.ts
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { prisma, resetDb, ensureTestProduct } from "./_helpers";
import { teardownApp } from "./_e2e";

// ✅ ใช้ job จริงของคุณ (ต้อง export ใน ReservationsModule แล้ว)
import { ReservationsReleaseJob } from "../src/modules/reservations/job/reservations.release.job";

async function runTtlSweep(app: INestApplication, now?: Date) {
  const job = app.get(ReservationsReleaseJob, { strict: false });
  if (!job) {
    throw new Error(
      "ReservationsReleaseJob not found in DI. Ensure ReservationsModule is imported in AppModule and exports the job.",
    );
  }

  // รองรับชื่อเมธอดได้หลายแบบ เผื่อคุณตั้งชื่อไม่เหมือนกัน
  if (typeof (job as any).runOnce === "function") {
    return (job as any).runOnce(now ?? new Date());
  }
  if (typeof (job as any).releaseExpired === "function") {
    // ถ้าคุณยังไม่มี runOnce ก็เรียก releaseExpired ไปก่อน
    return (job as any).releaseExpired();
  }

  throw new Error(
    "ReservationsReleaseJob has no runOnce() or releaseExpired(). Add runOnce(now?: Date) for tests.",
  );
}

describe("reservations TTL auto-release (e2e)", () => {
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

  it("expired reservation -> sweep แล้วต้องคืน reserved และ reservation ต้อง EXPIRED (stock ไม่เปลี่ยน)", async () => {
    const product = await ensureTestProduct();

    // ตั้งค่า baseline ให้ชัด
    await prisma.flashSaleItem.update({
      where: { productId: product.id },
      data: { stock: 3, reserved: 0, sold: 0 },
    });

    // reserve ผ่าน endpoint จริง
    const reserveRes = await request(app.getHttpServer())
      .post(`/flashsale/${product.id}/reserve`)
      .send({ qty: 1 })
      .expect(201);

    const reservationId =
      reserveRes.body?.reservationId ?? reserveRes.body?.id ?? null;
    expect(reservationId).toBeTruthy();

    // ก่อนหมดอายุ: reserved ต้องเพิ่มเป็น 1, stock ต้องคงเดิม 3 (ตามดีไซน์)
    const beforeItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
      select: { stock: true, reserved: true, sold: true },
    });
    expect(beforeItem).toBeTruthy();
    expect(beforeItem!.reserved).toBe(1);
    expect(beforeItem!.stock).toBe(3);
    expect(beforeItem!.sold).toBe(0);

    // ทำให้หมดอายุทันที
    const fakeNow = new Date(Date.now() + 5_000);
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { expiresAt: new Date(Date.now() - 1000) } as any,
    });

    // ✅ สั่ง sweep ผ่าน job จริง
    await runTtlSweep(app, fakeNow);

    // reservation ต้องถูก mark เป็น EXPIRED (หรือ CANCELED ถ้าคุณใช้ชื่อนั้น)
    const rAfter = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { status: true },
    });
    expect(rAfter).toBeTruthy();
    expect(["EXPIRED", "CANCELED", "CANCELLED"]).toContain(
      rAfter!.status as any,
    );

    // หลัง sweep: reserved ต้องคืนกลับเป็น 0, stock ต้อง "ไม่เปลี่ยน" (ยัง 3)
    const afterItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
      select: { stock: true, reserved: true, sold: true },
    });
    expect(afterItem).toBeTruthy();
    expect(afterItem!.reserved).toBe(0);
    expect(afterItem!.stock).toBe(3);
    expect(afterItem!.sold).toBe(0);
  });

  it("ถ้า reservation ถูก CONFIRMED แล้ว sweep ห้ามคืน reserved/stock", async () => {
    const product = await ensureTestProduct();

    await prisma.flashSaleItem.update({
      where: { productId: product.id },
      data: { stock: 3, reserved: 0, sold: 0 },
    });

    const reserveRes = await request(app.getHttpServer())
      .post(`/flashsale/${product.id}/reserve`)
      .send({ qty: 1 })
      .expect(201);

    const reservationId =
      reserveRes.body?.reservationId ?? reserveRes.body?.id ?? null;
    expect(reservationId).toBeTruthy();

    // ยัดให้ CONFIRMED และหมดอายุแล้ว
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CONFIRMED",
        expiresAt: new Date(Date.now() - 1000),
      } as any,
    });

    // ก่อน sweep: reserved ต้องเป็น 1, stock ยัง 3
    const beforeItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
      select: { stock: true, reserved: true, sold: true },
    });
    expect(beforeItem).toBeTruthy();
    expect(beforeItem!.reserved).toBe(1);
    expect(beforeItem!.stock).toBe(3);

    await runTtlSweep(app, new Date());

    // ✅ ต้องไม่โดนคืน เพราะ CONFIRMED แล้ว
    const afterItem = await prisma.flashSaleItem.findUnique({
      where: { productId: product.id },
      select: { stock: true, reserved: true, sold: true },
    });
    expect(afterItem).toBeTruthy();
    expect(afterItem!.reserved).toBe(1);
    expect(afterItem!.stock).toBe(3);
    expect(afterItem!.sold).toBe(0);
  });
});
