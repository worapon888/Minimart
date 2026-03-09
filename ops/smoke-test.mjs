#!/usr/bin/env node

const apiBase = process.env.API_BASE_URL ?? "http://localhost:4000";
const webBase = process.env.WEB_BASE_URL ?? "http://localhost:3000";

const checks = [
  { name: "API live health", url: `${apiBase}/health/live` },
  { name: "API ready health", url: `${apiBase}/health/ready` },
  { name: "API metrics", url: `${apiBase}/metrics` },
  { name: "Web home", url: webBase },
];

async function assertOk({ name, url }) {
  const res = await fetch(url, { redirect: "manual" });
  if (!res.ok) {
    throw new Error(`${name} failed: ${url} -> ${res.status}`);
  }
  console.log(`OK ${name}: ${res.status} ${url}`);
}

async function run() {
  for (const check of checks) {
    await assertOk(check);
  }
}

run().catch((err) => {
  console.error(`Smoke test failed: ${err.message}`);
  process.exit(1);
});
