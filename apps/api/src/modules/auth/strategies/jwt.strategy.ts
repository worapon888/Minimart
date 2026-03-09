import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../../prisma/prisma.service";
import { UserStatus } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

type JwtPayload = {
  sub: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const secret = config.get<string>("JWT_SECRET");
    if (!secret || secret.trim() === "") {
      // fail fast ตั้งแต่บูต (ไม่รอไปพังตอนยิง request)
      throw new Error("Missing JWT_SECRET");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user) throw new UnauthorizedException("User not found");
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("User disabled");
    }

    return user;
  }
}
