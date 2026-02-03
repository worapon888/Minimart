import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "node:fs";
import * as path from "node:path";
import { ProductsFile } from "./types/product";

/**
 * SEED CONFIG
 * - Set SEED_DEBUG=1 to enable debug logs
 * - Default: quiet
 */
const SEED_DEBUG = process.env.SEED_DEBUG === "1";

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
    // Keep logs quiet by default
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
                    createdAt: new Date(p.meta.createdAt),
                    updatedAt: new Date(p.meta.updatedAt),
                    barcode: p.meta.barcode ?? null,
                    qrCode: p.meta.qrCode ?? null,
                  },
                  update: {
                    createdAt: new Date(p.meta.createdAt),
                    updatedAt: new Date(p.meta.updatedAt),
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
                  date: new Date(r.date),
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
                  createdAt: new Date(p.meta.createdAt),
                  updatedAt: new Date(p.meta.updatedAt),
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
                  date: new Date(r.date),
                  reviewerName: r.reviewerName,
                  reviewerEmail: r.reviewerEmail,
                })),
              }
            : undefined,
        },
      });
    }

    console.log("✅ Seed completed successfully");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error("❌ Seed crashed:", e);
  process.exit(1);
});
