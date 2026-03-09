import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import cookieParser from "cookie-parser";
import { AppModule } from "../src/app.module";
import { prisma, resetDb } from "./_helpers";
import { teardownApp } from "./_e2e";

const REGISTER_PATH = "/auth/register";
const LOGIN_PATH = "/auth/login";
const REFRESH_PATH = "/auth/refresh";
const LOGOUT_PATH = "/auth/logout";

const COOKIE_NAME = "refresh_token";

function asStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v))
    return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string") return [v];
  return [];
}

function pickCookie(setCookie: unknown, name: string) {
  const rows = asStringArray(setCookie);
  return rows.find((c) => c.startsWith(`${name}=`)) ?? null;
}

function cookieKv(cookieRow: string) {
  return cookieRow.split(";")[0]; // "refresh_token=xxx"
}

function cookieToken(cookieRow: string) {
  const kv = cookieKv(cookieRow);
  return kv.split("=", 2)[1] ?? "";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("auth refresh (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();

    // ✅ e2e ไม่ผ่าน main.ts
    app.use(cookieParser());
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

  it("login -> ต้อง set httpOnly refresh cookie", async () => {
    const email = "rt1@test.com";

    await request(app.getHttpServer())
      .post(REGISTER_PATH)
      .send({ email, password: "password123", name: "Test User" })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(LOGIN_PATH)
      .send({ email, password: "password123" })
      .expect(201);

    expect(typeof res.body.accessToken).toBe("string");

    const rtRow = pickCookie(res.headers["set-cookie"], COOKIE_NAME);
    expect(rtRow).toBeTruthy();
    expect(rtRow!).toContain("HttpOnly");
  });

  it("refresh -> ต้องได้ accessToken ใหม่ และ refresh cookie ใหม่ (rotation)", async () => {
    const email = "rt2@test.com";

    await request(app.getHttpServer())
      .post(REGISTER_PATH)
      .send({ email, password: "password123", name: "Test User" })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post(LOGIN_PATH)
      .send({ email, password: "password123" })
      .expect(201);

    const rtRow1 = pickCookie(loginRes.headers["set-cookie"], COOKIE_NAME);
    expect(rtRow1).toBeTruthy();

    const cookieHeader1 = cookieKv(rtRow1!);
    const token1 = cookieToken(rtRow1!);

    await sleep(1100);

    const refreshRes = await request(app.getHttpServer())
      .post(REFRESH_PATH)
      .set("Cookie", cookieHeader1)
      .expect((r) => {
        // บางคนทำ refresh เป็น 200 บางคน 201 — รองรับทั้งคู่แบบ “เนี๊ยบ”
        if (r.status !== 200 && r.status !== 201)
          throw new Error(`Unexpected status ${r.status}`);
      });

    expect(typeof refreshRes.body.accessToken).toBe("string");

    const rtRow2 = pickCookie(refreshRes.headers["set-cookie"], COOKIE_NAME);
    expect(rtRow2).toBeTruthy();
    const token2 = cookieToken(rtRow2!);

    expect(token2).not.toBe(token1);
  });

  it("reuse refresh cookie เก่าหลัง rotate -> ต้อง 401", async () => {
    const email = "rt3@test.com";

    await request(app.getHttpServer())
      .post(REGISTER_PATH)
      .send({ email, password: "password123", name: "Test User" })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post(LOGIN_PATH)
      .send({ email, password: "password123" })
      .expect(201);

    const rtRow1 = pickCookie(loginRes.headers["set-cookie"], COOKIE_NAME);
    expect(rtRow1).toBeTruthy();

    const cookieOld = cookieKv(rtRow1!);
    const tokenOld = cookieToken(rtRow1!);

    await sleep(1100);

    const refreshRes1 = await request(app.getHttpServer())
      .post(REFRESH_PATH)
      .set("Cookie", cookieOld)
      .expect((r) => {
        if (r.status !== 200 && r.status !== 201)
          throw new Error(`Unexpected status ${r.status}`);
      });

    const rtRow2 = pickCookie(refreshRes1.headers["set-cookie"], COOKIE_NAME);
    expect(rtRow2).toBeTruthy();

    const cookieNew = cookieKv(rtRow2!);
    const tokenNew = cookieToken(rtRow2!);
    expect(tokenNew).not.toBe(tokenOld);

    await sleep(1100);
    await request(app.getHttpServer())
      .post(REFRESH_PATH)
      .set("Cookie", cookieNew)
      .expect((r) => {
        if (r.status !== 200 && r.status !== 201)
          throw new Error(`Unexpected status ${r.status}`);
      });

    await request(app.getHttpServer())
      .post(REFRESH_PATH)
      .set("Cookie", cookieOld)
      .expect(401);
  });

  it("logout -> refresh ต้อง 401 และ cookie ควรถูก clear (ถ้ามี)", async () => {
    const email = "rt4@test.com";

    await request(app.getHttpServer())
      .post(REGISTER_PATH)
      .send({ email, password: "password123", name: "Test User" })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post(LOGIN_PATH)
      .send({ email, password: "password123" })
      .expect(201);

    const rtRow1 = pickCookie(loginRes.headers["set-cookie"], COOKIE_NAME);
    expect(rtRow1).toBeTruthy();
    const cookie1 = cookieKv(rtRow1!);

    const logoutRes = await request(app.getHttpServer())
      .post(LOGOUT_PATH)
      .set("Cookie", cookie1)
      .expect((r) => {
        if (r.status !== 200 && r.status !== 201)
          throw new Error(`Unexpected status ${r.status}`);
      });

    const cleared = pickCookie(logoutRes.headers["set-cookie"], COOKIE_NAME);
    if (cleared) {
      expect(cleared).toMatch(/Max-Age=0|Expires=/i);
    }

    await request(app.getHttpServer())
      .post(REFRESH_PATH)
      .set("Cookie", cookie1)
      .expect(401);
  });
});
