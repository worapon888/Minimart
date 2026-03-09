import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { sha256, daysFromNow } from "./auth.tokens";
import type { StringValue } from "ms";
import { randomUUID } from "node:crypto";

type ClientCtx = {
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /** ---------- config helpers ---------- */
  private accessTtl(): StringValue {
    return (this.config.get<string>("JWT_ACCESS_TTL") || "15m") as StringValue;
  }

  private refreshDays(): number {
    const raw = this.config.get<string>("REFRESH_TOKEN_DAYS");
    const n = raw ? Number(raw) : 14;
    return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 14;
  }

  private refreshSecret(): string {
    const s =
      this.config.get<string>("JWT_REFRESH_SECRET") ||
      this.config.get<string>("JWT_SECRET") ||
      "";

    if (!s) throw new Error("Missing JWT_REFRESH_SECRET/JWT_SECRET");
    return s;
  }

  /** ---------- sign tokens ---------- */
  private signAccessToken(userId: string): string {
    return this.jwt.sign({ sub: userId }, { expiresIn: this.accessTtl() });
  }

  private signRefreshToken(userId: string): string {
    const ttl = `${this.refreshDays()}d` as StringValue;

    // ✅ สำคัญมาก: ใส่ jti เพื่อให้ refresh token "ไม่ซ้ำ" ทุกครั้ง
    return this.jwt.sign(
      { sub: userId, typ: "refresh", jti: randomUUID() },
      { secret: this.refreshSecret(), expiresIn: ttl },
    );
  }

  /** ---------- user checks ---------- */
  private async ensureActiveUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (!user) throw new UnauthorizedException("User not found");
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("User disabled");
    }

    return user;
  }

  /** ---------- refresh token persistence ---------- */
  private async saveRefreshToken(
    userId: string,
    refreshTokenPlain: string,
    ctx?: ClientCtx,
  ) {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: sha256(refreshTokenPlain), // ✅ schema แนะนำให้ @unique
        expiresAt: daysFromNow(this.refreshDays()),
        ip: ctx?.ip,
        userAgent: ctx?.userAgent,
      },
      select: { id: true },
    });
  }

  private async revokeRefreshToken(refreshTokenPlain: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: sha256(refreshTokenPlain), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async revokeAllUserRefreshTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** ---------- public API ---------- */

  async register(
    email: string,
    password: string,
    name?: string,
    ctx?: ClientCtx,
  ) {
    const existed = await this.prisma.user.findUnique({ where: { email } });
    if (existed) throw new ConflictException("Email already exists");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name?.trim() || null,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    const accessToken = this.signAccessToken(user.id);
    const refreshToken = this.signRefreshToken(user.id);
    await this.saveRefreshToken(user.id, refreshToken, ctx);

    return { user, accessToken, refreshToken };
  }

  async login(email: string, password: string, ctx?: ClientCtx) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    if (!user) throw new UnauthorizedException("Invalid credentials");
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    const accessToken = this.signAccessToken(user.id);
    const refreshToken = this.signRefreshToken(user.id);
    await this.saveRefreshToken(user.id, refreshToken, ctx);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * refresh: rotate refresh token
   * - ใช้ oldRefreshToken ได้ครั้งเดียว
   * - ออก access ใหม่ + refresh ใหม่
   * - ถ้าเอา refresh เก่ามายิงซ้ำ = reuse detection -> revoke ทั้ง user
   */
  async refresh(oldRefreshToken: string, ctx?: ClientCtx) {
    let payload: any;

    try {
      payload = this.jwt.verify(oldRefreshToken, {
        secret: this.refreshSecret(),
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (payload?.typ !== "refresh") {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const userId = String(payload.sub || "");
    const user = await this.ensureActiveUser(userId);

    const oldHash = sha256(oldRefreshToken);

    // 1) หา token ที่ยัง active อยู่ใน DB (ตัวที่ควร rotate ได้)
    const activeRow = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash: oldHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!activeRow) {
      // 2) ถ้าไม่เจอ active อาจเป็น "reuse" (เคยถูก rotate/revoke ไปแล้ว)
      const maybeReused = await this.prisma.refreshToken.findFirst({
        where: { userId, tokenHash: oldHash },
        select: { revokedAt: true, replacedBy: true, expiresAt: true },
      });

      // ถ้าเคยถูก revoke และมี replacedBy => ถือว่า token เก่าถูกเอามาใช้ซ้ำ (เสี่ยงโดนขโมย)
      if (maybeReused?.revokedAt && maybeReused?.replacedBy) {
        await this.revokeAllUserRefreshTokens(userId);
        throw new UnauthorizedException("Refresh token reuse detected");
      }

      throw new UnauthorizedException("Refresh token revoked/expired");
    }

    // 3) rotate: ออกตัวใหม่
    const newRefreshToken = this.signRefreshToken(user.id);
    const newHash = sha256(newRefreshToken);

    // 4) revoke ตัวเก่า + ผูก replacedBy -> newHash (ทำให้ reuse detection ทำได้)
    await this.prisma.refreshToken.update({
      where: { id: activeRow.id },
      data: { revokedAt: new Date(), replacedBy: newHash },
    });

    // 5) สร้าง row ใหม่
    await this.saveRefreshToken(user.id, newRefreshToken, ctx);

    const accessToken = this.signAccessToken(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return { ok: true };
    await this.revokeRefreshToken(refreshToken);
    return { ok: true };
  }

  async syncGoogleUser(email: string, name?: string | null) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) throw new UnauthorizedException("Invalid google user");

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (existing) {
      if (existing.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException("User disabled");
      }

      if ((name ?? "").trim() && existing.name !== (name ?? "").trim()) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: { name: (name ?? "").trim() || null },
        });
      }

      return {
        id: existing.id,
        email: existing.email,
        name: (name ?? "").trim() || existing.name,
        role: existing.role,
      };
    }

    const passwordHash = await bcrypt.hash(`google_${randomUUID()}`, 10);
    const created = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: (name ?? "").trim() || null,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return created;
  }
}
