import http from "k6/http";
import { check, sleep } from "k6";
import exec from "k6/execution";
import { Rate, Trend } from "k6/metrics";

const BASE = __ENV.BASE_URL || "http://localhost:4000";
const MODE = (__ENV.MODE || "orders").toLowerCase(); // orders | orders_pay

const RATE = Number(__ENV.RATE || "10"); // arrivals per timeUnit
const TIME_UNIT = __ENV.TIME_UNIT || "1s";
const DURATION = __ENV.DURATION || "5m";
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS || "30");
const MAX_VUS = Number(__ENV.MAX_VUS || "200");
const THINK_TIME_MS = Number(__ENV.THINK_TIME_MS || "50");
const PRODUCTS_LIMIT = Number(__ENV.PRODUCTS_LIMIT || "50");

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 499 }));

export const ordersSuccess = new Rate("checkout_orders_success");
export const ordersError = new Rate("checkout_orders_error");
export const paySuccess = new Rate("checkout_pay_success");
export const payError = new Rate("checkout_pay_error");
export const ordersLatencyMs = new Trend("checkout_orders_latency_ms");
export const payLatencyMs = new Trend("checkout_pay_latency_ms");

export const options = {
  scenarios: {
    checkout_capacity: {
      executor: "constant-arrival-rate",
      rate: RATE,
      timeUnit: TIME_UNIT,
      duration: DURATION,
      preAllocatedVUs: PRE_ALLOCATED_VUS,
      maxVUs: MAX_VUS,
      exec: "flow",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
    checkout_orders_success: ["rate>0.98"],
    checkout_orders_error: ["rate<0.02"],
    checkout_orders_latency_ms: ["p(95)<1200", "p(99)<2500"],
    checkout_pay_success: ["rate>0.98"],
    checkout_pay_error: ["rate<0.02"],
    checkout_pay_latency_ms: ["p(95)<1500", "p(99)<3000"],
  },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildItems(productIds) {
  const count = randomInt(1, Math.min(3, productIds.length));
  const selected = new Set();
  while (selected.size < count) selected.add(pickRandom(productIds));
  return [...selected].map((id) => ({
    productId: id,
    qty: randomInt(1, 2),
  }));
}

function parseProducts(res) {
  let json;
  try {
    json = res.json();
  } catch {
    return [];
  }

  const raw = Array.isArray(json) ? json : json?.data;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((p) => p?.id)
    .filter((id) => typeof id === "string" && id.length > 0);
}

export function setup() {
  const res = http.get(`${BASE}/products?limit=${PRODUCTS_LIMIT}&offset=0`, {
    headers: { Accept: "application/json" },
    tags: { name: "products_list" },
  });

  if (res.status !== 200) {
    throw new Error(`Failed to fetch products: status=${res.status}`);
  }

  const productIds = parseProducts(res);
  if (productIds.length === 0) {
    throw new Error("No products found for capacity test");
  }

  return { productIds };
}

function createOrder(data, idemKey) {
  const body = JSON.stringify({
    idempotencyKey: idemKey,
    items: buildItems(data.productIds),
    shipping: {
      name: "k6 User",
      tel: "0812345678",
      address: "k6 load test address",
      email: "k6@test.local",
    },
  });

  const startedAt = Date.now();
  const res = http.post(`${BASE}/checkout/orders`, body, {
    headers: { "Content-Type": "application/json" },
    tags: { name: "checkout_orders" },
  });
  const ms = Date.now() - startedAt;
  ordersLatencyMs.add(ms);

  const ok = res.status === 201 && !!res.json("orderId");
  ordersSuccess.add(ok);
  ordersError.add(!ok);

  check(res, {
    "orders status is 201": (r) => r.status === 201,
    "orders has orderId": (r) => !!r.json("orderId"),
  });

  return res;
}

function payOrder(orderId, idemKey) {
  const body = JSON.stringify({ idempotencyKey: idemKey });
  const startedAt = Date.now();
  const res = http.post(`${BASE}/checkout/${orderId}/pay`, body, {
    headers: { "Content-Type": "application/json" },
    tags: { name: "checkout_pay" },
  });
  const ms = Date.now() - startedAt;
  payLatencyMs.add(ms);

  const ok = res.status === 201 && !!res.json("paymentIntentId");
  paySuccess.add(ok);
  payError.add(!ok);

  check(res, {
    "pay status is 201": (r) => r.status === 201,
    "pay has paymentIntentId": (r) => !!r.json("paymentIntentId"),
  });
}

export function flow(data) {
  const vu = exec.vu.idInTest;
  const iter = exec.vu.iterationInScenario;
  const baseKey = `k6_${vu}_${iter}_${Date.now()}`;

  const orderRes = createOrder(data, `ord_${baseKey}`);
  if (orderRes.status !== 201) return;

  if (MODE === "orders_pay") {
    const orderId = orderRes.json("orderId");
    if (orderId) {
      payOrder(orderId, `pay_${baseKey}`);
    }
  }

  sleep(THINK_TIME_MS / 1000);
}

export default flow;
