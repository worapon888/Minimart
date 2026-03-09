const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/promote-admin.js <email>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

(async () => {
  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log("✅ promoted to ADMIN:", email);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error("❌ error:", e);
  process.exit(1);
});
