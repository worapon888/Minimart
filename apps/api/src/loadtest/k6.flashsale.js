import http from "k6/http";
import { check, sleep } from "k6";
import exec from "k6/execution";
import { Rate } from "k6/metrics";

// ✅ ทำให้ 409/429 ไม่ถูกนับเป็น http_req_failed
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 429 }));

// ---------- metrics ----------
export const reserveSuccess = new Rate("reserve_success");
export const reserveSoldOut = new Rate("reserve_soldout");
export const reserveThrottled = new Rate("reserve_throttled");
export const reserveOtherErr = new Rate("reserve_other_err");

// ---------- config ----------
const BASE = __ENV.BASE_URL || "http://localhost:4000";

// IMPORTANT: script นี้ “ยิง endpoint /flashsale/:itemId/reserve”
// ดังนั้น ENV ที่ถูกต้องคือ FLASHSALE_ID = FlashSaleItem.id
const DEFAULT_FLASHSALE_ID = "REPLACE_ME";
const INPUT_ID =
  __ENV.FLASHSALE_ID ||
  __ENV.ITEM_ID ||
  __ENV.PRODUCT_ID ||
  DEFAULT_FLASHSALE_ID;

// ถ้า 1 = ไม่เรียก debug endpoint
const SKIP_DEBUG = String(__ENV.SKIP_DEBUG || "") === "1";

// log 1% ของ request กัน console ถล่ม
const LOG_SAMPLE_RATE = Number(__ENV.LOG_SAMPLE_RATE || "0.01");

// pacing แยกตาม scenario (override ได้)
const STABILITY_SLEEP_SEC = Number(__ENV.STABILITY_SLEEP_SEC || "0.8");
const STRESS_SLEEP_SEC = Number(__ENV.STRESS_SLEEP_SEC || "0.2");

// threshold stress ยอม 429 ได้มากกว่า
const THROTTLE_OK_RATE_STRESS = Number(__ENV.THROTTLE_OK_RATE || "0.35");
// threshold stability ต้องนิ่ง
const THROTTLE_OK_RATE_STABILITY = Number(
  __ENV.THROTTLE_OK_RATE_STABILITY || "0.05",
);

function shouldLog() {
  return Math.random() < LOG_SAMPLE_RATE;
}

function rand4() {
  return Math.floor(Math.random() * 9000) + 1000;
}

function uid() {
  const vu = exec.vu?.idInTest ?? 0;
  const it = exec.vu?.iterationInScenario ?? exec.vu?.iterationInInstance ?? 0;
  return `${vu}_${it}_${Date.now()}_${rand4()}`;
}

// ✅ ให้แต่ละ VU มี client id ของตัวเอง (ถ้า throttle ตาม header นี้)
function clientId() {
  const vu = exec.vu?.idInTest ?? 0;
  return `k6_vu_${vu}`;
}

function isSoldOut(res) {
  if (res.status === 409) return true;
  const b = String(res.body || "").toLowerCase();
  if (res.status === 400 && b.includes("sold out")) return true;
  return false;
}

function isThrottled(res) {
  return res.status === 429;
}

// ---------- scenarios ----------
export const options = {
  scenarios: {
    stability: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: 5 },
        { duration: "40s", target: 8 },
        { duration: "20s", target: 0 },
      ],
      gracefulRampDown: "30s",
      exec: "flow",
      tags: { test: "stability" },
    },
    stress: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: 10 },
        { duration: "40s", target: 25 },
        { duration: "20s", target: 0 },
      ],
      gracefulRampDown: "30s",
      exec: "flow",
      tags: { test: "stress" },
    },
  },

  thresholds: {
    http_req_duration: ["p(95)<800"],
    reserve_other_err: ["rate<0.01"],

    // tag filter: metric{test:xxx}
    "reserve_throttled{test:stress}": [`rate<${THROTTLE_OK_RATE_STRESS}`],
    "reserve_throttled{test:stability}": [`rate<${THROTTLE_OK_RATE_STABILITY}`],
  },
};

// ---------- setup ----------
// เป้าหมาย: คืนค่า itemId (FlashSaleItem.id) ที่ถูกต้อง
export function setup() {
  if (!INPUT_ID || INPUT_ID === "REPLACE_ME") {
    throw new Error(
      "Missing FLASHSALE_ID (or ITEM_ID). Example: -e FLASHSALE_ID=xxxx",
    );
  }

  // ✅ ถ้าคุณมั่นใจว่า INPUT_ID เป็น FlashSaleItem.id อยู่แล้ว
  if (SKIP_DEBUG) {
    return { itemId: INPUT_ID };
  }

  // optional debug endpoint: ให้ map id ได้ (ช่วยกรณี user ส่ง productId ผิด)
  const debugUrl = `${BASE}/flashsale/_debug/items`;
  const res = http.get(debugUrl, {
    headers: { Accept: "application/json" },
    tags: { name: "debug_items" },
  });

  // ถ้าไม่มี endpoint นี้ก็ fallback
  if (res.status !== 200) {
    if (shouldLog())
      console.log(
        `DEBUG endpoint unavailable (${res.status}) -> use INPUT_ID as itemId`,
      );
    return { itemId: INPUT_ID };
  }

  let items;
  try {
    items = res.json();
  } catch {
    if (shouldLog()) console.log(`DEBUG not JSON -> use INPUT_ID as itemId`);
    return { itemId: INPUT_ID };
  }

  if (!Array.isArray(items)) {
    if (shouldLog())
      console.log(`DEBUG unexpected shape -> use INPUT_ID as itemId`);
    return { itemId: INPUT_ID };
  }

  // หาได้ทั้งแบบส่ง itemId ตรง ๆ หรือส่ง productId มา
  const found =
    items.find((x) => x?.id === INPUT_ID) ||
    items.find((x) => x?.productId === INPUT_ID);

  if (found?.id) return { itemId: found.id };

  if (shouldLog()) console.log(`DEBUG cannot map -> use INPUT_ID as itemId`);
  return { itemId: INPUT_ID };
}

// ---------- main flow ----------
export function flow(data) {
  const itemId = data?.itemId || INPUT_ID;
  const scenario = exec.scenario.name; // stability | stress
  const pacing =
    scenario === "stability" ? STABILITY_SLEEP_SEC : STRESS_SLEEP_SEC;

  const idem = `reserve_${uid()}`;
  const headers = {
    "Content-Type": "application/json",
    "X-Client-Id": clientId(),
    "Idempotency-Key": idem,
  };

  const body = JSON.stringify({ qty: 1, idempotencyKey: idem });

  const r1 = http.post(`${BASE}/flashsale/${itemId}/reserve`, body, {
    headers,
    tags: { name: "reserve" },
  });

  const throttled = isThrottled(r1);
  const soldOut = isSoldOut(r1);
  const success = r1.status === 200 || r1.status === 201;

  reserveSuccess.add(success);
  reserveSoldOut.add(soldOut);
  reserveThrottled.add(throttled);
  reserveOtherErr.add(!success && !soldOut && !throttled);

  if (throttled && shouldLog()) {
    console.log(`429 reserve body=${String(r1.body).slice(0, 200)}`);
  }

  if (!success && !soldOut && !throttled && shouldLog()) {
    console.log(
      `OTHER_ERR reserve status=${r1.status} url=${r1.url} body=${String(r1.body).slice(0, 300)}`,
    );
  }

  check(r1, {
    "reserve expected outcome": () => success || soldOut || throttled,
  });

  // ถ้าไม่ success ก็พักแล้ววนต่อ (ไม่ต้อง parse json)
  if (!success) {
    sleep(pacing);
    return;
  }

  // parse reservationId (กัน json พัง)
  let reservationId = null;
  try {
    reservationId =
      r1.json("reservationId") || r1.json("id") || r1.json("reservation.id");
  } catch {
    reserveOtherErr.add(true);
    if (shouldLog()) {
      console.log(
        `OTHER_ERR parse_json_fail status=${r1.status} body=${String(r1.body).slice(0, 300)}`,
      );
    }
    sleep(pacing);
    return;
  }

  check(reservationId, { "has reservationId": (x) => !!x });

  if (!reservationId) {
    reserveOtherErr.add(true);
    if (shouldLog()) {
      console.log(
        `OTHER_ERR missing_reservationId body=${String(r1.body).slice(0, 300)}`,
      );
    }
  }

  sleep(pacing);
}

export default flow;
