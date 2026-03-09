// test/_helpers.ts
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "Missing DATABASE_URL. Make sure test/jest.env.ts loads .env.test before importing _helpers.ts",
  );
}

const adapter = new PrismaPg({ connectionString: url });
export const prisma = new PrismaClient({ adapter });

/**
 * Reset DB state for E2E tests.
 * Goal: clear transactional data (orders/reservations/idempotency/webhook/payment)
 * but keep seeded catalog (products/flashSaleItem baseline) intact.
 *
 * ✅ Updated for schema:
 * - has OrderItem -> must delete before Order
 * - has read models DailySales/TopProduct -> often should be cleared to keep tests deterministic
 * - has User (role/status/passwordHash) -> usually safe to clear users in test DB
 */
export async function resetDb() {
  // IMPORTANT: delete child -> parent to avoid FK issues

  // 0) Read models (ถ้าคุณมี dashboard / aggregation tests ควรลบเพื่อกันเพี้ยน)
  await prisma.topProduct.deleteMany();
  await prisma.dailySales.deleteMany();

  // 1) Webhook / payment logs
  await prisma.webhookEvent.deleteMany();
  await prisma.paymentIntent.deleteMany();

  // 2) Orders (child -> parent)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  // 3) Reservations
  await prisma.reservation.deleteMany();

  // 4) Idempotency keys
  await prisma.idempotencyKey.deleteMany();

  // 5) Users (ใน test env ส่วนใหญ่ลบทิ้งได้เลยเพื่อกัน email ซ้ำ)
  // ถ้าคุณมี user seed สำคัญและไม่อยากลบ ให้เปลี่ยนเป็น delete เฉพาะอีเมล test แทน
  await prisma.user.deleteMany();

  // ✅ ไม่ลบ product / flashSaleItem baseline เพื่อให้ seed คงอยู่
}

/**
 * Ensure there is at least 1 product + flashSaleItem baseline for tests.
 * - ไม่พึ่ง seed ภายนอก
 * - deterministic พอให้ reuse ได้
 */
export async function ensureTestProduct() {
  const baseSku = "E2E-PRODUCT";

  const existing = await prisma.product.findUnique({
    where: { sku: baseSku } as any,
  });

  if (existing) {
    await prisma.flashSaleItem.upsert({
      where: { productId: existing.id },
      update: { stock: 20, reserved: 0, sold: 0 },
      create: { productId: existing.id, stock: 20, reserved: 0, sold: 0 },
    });

    return existing;
  }

  const p = await prisma.product.create({
    data: {
      sku: baseSku,
      title: "E2E Test Product",
      category: "TEST",
      priceCents: 1999,
    } as any,
  });

  await prisma.flashSaleItem.create({
    data: { productId: p.id, stock: 20, reserved: 0, sold: 0 },
  });

  return p;
}

/**
 * Ensure there is a user for auth tests.
 * - default role CUSTOMER
 * - ACTIVE status
 * - passwordHash is already hashed (pass in hashed string)
 *
 * You can hash in test with bcryptjs if you want:
 *   const hash = await bcrypt.hash("password123", 10)
 */
export async function ensureTestUser(params: {
  email?: string;
  passwordHash: string;
  role?: UserRole;
  status?: UserStatus;
  name?: string | null;
}) {
  const email = params.email ?? "e2e-user@test.com";

  return prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: params.passwordHash,
      role: params.role ?? UserRole.CUSTOMER,
      status: params.status ?? UserStatus.ACTIVE,
      name: params.name ?? null,
    },
    create: {
      email,
      passwordHash: params.passwordHash,
      role: params.role ?? UserRole.CUSTOMER,
      status: params.status ?? UserStatus.ACTIVE,
      name: params.name ?? null,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      name: true,
    },
  });
}
