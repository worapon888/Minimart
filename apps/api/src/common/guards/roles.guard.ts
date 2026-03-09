import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { role?: UserRole } | undefined;

    // ถ้าไม่มี user แปลว่าควรโดน JwtAuthGuard จัดการ 401 ไปแล้ว
    if (!user?.role) throw new ForbiddenException("Missing role");

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Forbidden");
    }

    return true;
  }
}
