import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";

@Injectable()
export class RangeLimitGuard implements CanActivate {
  constructor(private readonly maxDays = 90) {}

  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const { from, to } = req.query;

    if (!from || !to) return true;

    const f = new Date(from);
    const t = new Date(to);

    if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return true;

    // normalize to midnight
    f.setHours(0, 0, 0, 0);
    t.setHours(0, 0, 0, 0);

    if (t < f) throw new BadRequestException("to must be >= from");

    const diffDays = Math.floor((t.getTime() - f.getTime()) / 86400000) + 1;
    if (diffDays > this.maxDays) {
      throw new BadRequestException(
        `date range too large (max ${this.maxDays} days)`,
      );
    }

    return true;
  }
}
