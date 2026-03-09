import type { INestApplication } from "@nestjs/common";

let SchedulerRegistry: any;
try {
  SchedulerRegistry = require("@nestjs/schedule").SchedulerRegistry;
} catch {
  SchedulerRegistry = null;
}

export async function stopSchedulers(app: INestApplication) {
  if (!SchedulerRegistry) return;

  try {
    const reg = app.get(SchedulerRegistry, { strict: false });
    if (!reg) return;

    // 1) cron jobs
    for (const job of reg.getCronJobs().values()) {
      try {
        job.stop();
      } catch {}
    }

    // 2) intervals
    for (const name of reg.getIntervals()) {
      try {
        clearInterval(reg.getInterval(name));
      } catch {}
    }

    // 3) timeouts
    for (const name of reg.getTimeouts()) {
      try {
        clearTimeout(reg.getTimeout(name));
      } catch {}
    }
  } catch {
    // ignore
  }
}

export async function teardownApp(
  app: INestApplication,
  prisma: { $disconnect: () => Promise<void> },
) {
  await stopSchedulers(app);

  try {
    await app.close();
  } catch {}

  try {
    await prisma.$disconnect();
  } catch {}
}
