import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GoogleSyncDto } from "./dto/google-sync.dto";

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  /** ---------- cookie helpers ---------- */

  private refreshDays(): number {
    const n = Number(process.env.REFRESH_TOKEN_DAYS ?? 14);
    return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 14;
  }

  private cookieSecure(): boolean {
    // ✅ dev/test = false, prod https = true
    const raw = String(process.env.COOKIE_SECURE ?? "").toLowerCase();
    if (raw === "true" || raw === "1") return true;
    if (raw === "false" || raw === "0") return false;
    return process.env.NODE_ENV === "production";
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    const days = this.refreshDays();

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: this.cookieSecure(),
      path: "/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * days,
    });
  }

  private clearRefreshCookie(res: Response) {
    // ✅ ต้อง clear ด้วย option ที่ "สอดคล้อง" กับตอน set
    res.clearCookie("refresh_token", {
      path: "/auth/refresh",
      sameSite: "lax",
      secure: this.cookieSecure(),
    });
  }

  private ctx(req: Request) {
    return {
      ip: req.ip,
      userAgent: req.headers["user-agent"] as string | undefined,
    };
  }

  private getRefreshCookie(req: Request): string | undefined {
    // ต้องมี cookie-parser middleware ถึงจะมี req.cookies
    const cookies = (req as any).cookies as Record<string, string> | undefined;
    return cookies?.refresh_token;
  }

  /** ---------- routes ---------- */

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const out = await this.auth.register(
      dto.email,
      dto.password,
      dto.name,
      this.ctx(req),
    );

    this.setRefreshCookie(res, out.refreshToken);

    return {
      user: out.user,
      accessToken: out.accessToken,
    };
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const out = await this.auth.login(dto.email, dto.password, this.ctx(req));

    this.setRefreshCookie(res, out.refreshToken);

    return {
      user: out.user,
      accessToken: out.accessToken,
    };
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rt = this.getRefreshCookie(req);

    const out = await this.auth.refresh(rt ?? "", this.ctx(req));

    // ✅ rotate cookie ให้เป็นตัวใหม่
    this.setRefreshCookie(res, out.refreshToken);

    return {
      accessToken: out.accessToken,
    };
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rt = this.getRefreshCookie(req);

    await this.auth.logout(rt);

    this.clearRefreshCookie(res);

    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: any) {
    return req.user;
  }

  @Post("google-sync")
  async googleSync(@Body() dto: GoogleSyncDto) {
    const user = await this.auth.syncGoogleUser(dto.email, dto.name);
    return { user };
  }
}
