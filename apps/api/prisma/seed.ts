import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "node:fs";
import * as path from "node:path";
import { ProductsFile } from "./types/product";

/**
 * SEED CONFIG
 * - SEED_DEBUG=1 to enable debug logs
 * - SEED_FLASHSALE=0 to disable seeding FlashSaleItem
 * - FLASHSALE_STOCK=60 (default)
 * - FLASHSALE_QTY=1 (default)  // how many flash items to create
 * - FLASHSALE_SKU=SKU001       // optional: pick product by sku (preferred)
 */
const SEED_DEBUG = process.env.SEED_DEBUG === "1";
const SEED_FLASHSALE = process.env.SEED_FLASHSALE !== "0";
const FLASHSALE_STOCK = Number(process.env.FLASHSALE_STOCK || "60");
const FLASHSALE_QTY = Number(process.env.FLASHSALE_QTY || "1");
const FLASHSALE_SKU = process.env.FLASHSALE_SKU?.trim();

/**
 * Resolve paths
 * __dirname = apps/api/prisma
 * .env is at apps/api/.env
 */
const envPath = path.resolve(__dirname, "..", ".env");

/**
 * Load ENV early
 */
config({ path: envPath });

function debugLog(...args: unknown[]) {
  if (SEED_DEBUG) console.log(...args);
}

function assertEnv(name: string) {
  const v = process.env[name];
  if (!v) {
    console.error(`❌ Missing required env: ${name}`);
    console.error(`   - Expected .env at: ${envPath}`);
    console.error(`   - File exists: ${fs.existsSync(envPath) ? "Yes" : "No"}`);
    process.exit(1);
  }
  return v;
}

/**
 * Prisma 7: Using engine type "client" requires "adapter" or "accelerateUrl"
 * For local Postgres: adapter-pg is correct.
 */
function createPrisma() {
  const url = assertEnv("DATABASE_URL");

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
    log: SEED_DEBUG ? ["query", "info", "warn", "error"] : ["warn", "error"],
  });

  return { prisma, pool };
}

async function loadProducts(): Promise<ProductsFile["products"]> {
  const filePath = path.resolve(__dirname, "data", "products.json");

  if (!fs.existsSync(filePath)) {
    throw new Error(`products.json not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as ProductsFile;
  return data.products ?? [];
}

function safeDate(x: unknown): Date {
  const d = new Date(String(x));
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

/**
 * IMPORTANT:
 * FlashSaleItem upsert below assumes:
 * - FlashSaleItem.productId is UNIQUE (recommended)
 *   e.g. productId String @unique
 */
async function seedFlashSaleItems(prisma: PrismaClient) {
  if (!SEED_FLASHSALE) {
    debugLog("⚪ SEED_FLASHSALE=0, skip FlashSaleItem seed");
    return;
  }

  // pick products to attach flash sale to
  let picks: Array<{ id: string; sku: string | null; title: string }> = [];

  if (FLASHSALE_SKU) {
    const p = await prisma.product.findUnique({
      where: { sku: FLASHSALE_SKU },
      select: { id: true, sku: true, title: true },
    });

    if (!p) {
      console.log(
        `⚠️ FLASHSALE_SKU=${FLASHSALE_SKU} not found, fallback to first products`,
      );
    } else {
      picks = [p];
    }
  }

  if (picks.length === 0) {
    picks = await prisma.product.findMany({
      take: FLASHSALE_QTY,
      orderBy: { createdAt: "asc" },
      select: { id: true, sku: true, title: true },
    });
  }

  if (picks.length === 0) {
    console.log("⚠️ No products found, skip FlashSaleItem seed");
    return;
  }

  console.log(
    `⚡ Seeding FlashSaleItem x${picks.length} (stock=${FLASHSALE_STOCK})...`,
  );

  for (const prod of picks) {
    // If productId isn't unique in schema, this upsert will throw.
    const item = await prisma.flashSaleItem.upsert({
      where: { productId: prod.id },
      create: {
        productId: prod.id,
        stock: FLASHSALE_STOCK,
        reserved: 0,
        sold: 0,
        startsAt: new Date(),
        endsAt: null,
      },
      update: {
        stock: FLASHSALE_STOCK,
        reserved: 0,
        sold: 0,
        startsAt: new Date(),
        endsAt: null,
      },
    });

    console.log(`✅ FLASHSALE_ID=${item.id} (product=${prod.sku ?? prod.id})`);
  }
}

async function seed() {
  debugLog("🔍 Seed Debug:");
  debugLog("   - SEED FILE:", __filename);
  debugLog("   - CWD:", process.cwd());
  debugLog("   - ENV PATH:", envPath);
  debugLog("   - ENV EXISTS:", fs.existsSync(envPath));
  debugLog(
    "   - DATABASE_URL:",
    process.env.DATABASE_URL ? "Loaded" : "Missing",
  );

  const { prisma, pool } = createPrisma();

  try {
    const products = await loadProducts();
    console.log(`🌱 Seeding ${products.length} products...`);

    for (const p of products) {
      const priceCents = Math.round((p.price ?? 0) * 100);

      await prisma.product.upsert({
        where: { sku: p.sku },

        update: {
          title: p.title,
          description: p.description ?? null,
          category: p.category ?? null,
          brand: p.brand ?? null,

          priceCents,
          currency: "USD",

          discountPercentage: p.discountPercentage ?? null,
          rating: p.rating ?? null,
          weight: p.weight ?? null,
          warrantyInformation: p.warrantyInformation ?? null,
          shippingInformation: p.shippingInformation ?? null,
          availabilityStatus: p.availabilityStatus ?? null,
          returnPolicy: p.returnPolicy ?? null,
          minimumOrderQuantity: p.minimumOrderQuantity ?? null,

          tags: p.tags ?? [],
          images: p.images ?? [],
          thumbnail: p.thumbnail ?? null,
          imageUrl: p.thumbnail ?? p.images?.[0] ?? null,

          dimensions: p.dimensions
            ? {
                upsert: {
                  create: {
                    width: p.dimensions.width,
                    height: p.dimensions.height,
                    depth: p.dimensions.depth,
                  },
                  update: {
                    width: p.dimensions.width,
                    height: p.dimensions.height,
                    depth: p.dimensions.depth,
                  },
                },
              }
            : undefined,

          inventory: {
            upsert: {
              create: { onHand: p.stock ?? 0, reserved: 0 },
              update: { onHand: p.stock ?? 0 },
            },
          },

          meta: p.meta
            ? {
                upsert: {
                  create: {
                    createdAt: safeDate(p.meta.createdAt),
                    updatedAt: safeDate(p.meta.updatedAt),
                    barcode: p.meta.barcode ?? null,
                    qrCode: p.meta.qrCode ?? null,
                  },
                  update: {
                    createdAt: safeDate(p.meta.createdAt),
                    updatedAt: safeDate(p.meta.updatedAt),
                    barcode: p.meta.barcode ?? null,
                    qrCode: p.meta.qrCode ?? null,
                  },
                },
              }
            : undefined,

          // idempotent: replace reviews each run
          reviews: p.reviews
            ? {
                deleteMany: {},
                create: p.reviews.map((r) => ({
                  rating: r.rating,
                  comment: r.comment,
                  date: safeDate(r.date),
                  reviewerName: r.reviewerName,
                  reviewerEmail: r.reviewerEmail,
                })),
              }
            : undefined,
        },

        create: {
          sku: p.sku,
          title: p.title,
          description: p.description ?? null,
          category: p.category ?? null,
          brand: p.brand ?? null,

          priceCents,
          currency: "USD",
          status: "ACTIVE",

          discountPercentage: p.discountPercentage ?? null,
          rating: p.rating ?? null,
          weight: p.weight ?? null,
          warrantyInformation: p.warrantyInformation ?? null,
          shippingInformation: p.shippingInformation ?? null,
          availabilityStatus: p.availabilityStatus ?? null,
          returnPolicy: p.returnPolicy ?? null,
          minimumOrderQuantity: p.minimumOrderQuantity ?? null,

          tags: p.tags ?? [],
          images: p.images ?? [],
          thumbnail: p.thumbnail ?? null,
          imageUrl: p.thumbnail ?? p.images?.[0] ?? null,

          inventory: {
            create: { onHand: p.stock ?? 0, reserved: 0 },
          },

          dimensions: p.dimensions
            ? {
                create: {
                  width: p.dimensions.width,
                  height: p.dimensions.height,
                  depth: p.dimensions.depth,
                },
              }
            : undefined,

          meta: p.meta
            ? {
                create: {
                  createdAt: safeDate(p.meta.createdAt),
                  updatedAt: safeDate(p.meta.updatedAt),
                  barcode: p.meta.barcode ?? null,
                  qrCode: p.meta.qrCode ?? null,
                },
              }
            : undefined,

          reviews: p.reviews
            ? {
                create: p.reviews.map((r) => ({
                  rating: r.rating,
                  comment: r.comment,
                  date: safeDate(r.date),
                  reviewerName: r.reviewerName,
                  reviewerEmail: r.reviewerEmail,
                })),
              }
            : undefined,
        },
      });
    }

    // ✅ create/update FlashSaleItem(s) and print FLASHSALE_ID
    await seedFlashSaleItems(prisma);

    console.log("✅ Seed completed successfully");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error("❌ Seed crashed:", e);

  // Common hint: FlashSaleItem.productId must be unique for upsert
  if (
    String(e?.message || "")
      .toLowerCase()
      .includes("unique") ||
    String(e?.message || "")
      .toLowerCase()
      .includes("upsert")
  ) {
    console.error(
      "💡 Hint: FlashSaleItem.productId should be @unique to allow upsert({ where: { productId } })",
    );
  }

  process.exit(1);
});
