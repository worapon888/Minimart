import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { Observable, from, of } from "rxjs";
import { switchMap, tap } from "rxjs/operators";

@Injectable()
export class ProductsListCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    // ✅ ใช้เฉพาะ HTTP requests เท่านั้น (กันกรณีไปใช้กับ context อื่น)
    if (!req || !res) return next.handle();

    // ✅ Option A: ValidationPipe/DTO เป็นคนคุม (ที่นี่ไม่ clamp)
    const search = String(req.query?.search ?? "")
      .trim()
      .toLowerCase();
    const category = String(req.query?.category ?? "")
      .trim()
      .toLowerCase();

    // ทำ key ให้ "นิ่ง" (24 vs 024 => 24, " 24 " => 24)
    const limitRaw = String(req.query?.limit ?? "24").trim();
    const offsetRaw = String(req.query?.offset ?? "0").trim();

    const limit = this.canonNumberString(limitRaw, "24");
    const offset = this.canonNumberString(offsetRaw, "0");

    const cacheKey = `products:list:${search}|${category}|${limit}|${offset}`;

    return from(this.cache.get<any>(cacheKey)).pipe(
      switchMap((cached) => {
        if (cached) {
          res.setHeader("X-Cache", "HIT");
          return of(cached);
        }

        res.setHeader("X-Cache", "MISS");

        return next.handle().pipe(
          tap(async (body) => {
            try {
              // cache เฉพาะ response สำเร็จ
              const status = res.statusCode;
              if (status >= 200 && status < 300) {
                await this.cache.set(cacheKey, body);
              }
            } catch {
              // ignore cache error
            }
          }),
        );
      }),
    );
  }

  /**
   * ทำให้ query number ที่เป็น string "นิ่ง":
   * - ถ้าเป็นตัวเลขจริง => แปลงเป็น string ของ number (ลบ 0 นำหน้า)
   * - ถ้าไม่ใช่เลข => คืน fallback (ปล่อยให้ Validation จัดการ error อยู่แล้ว)
   */
  private canonNumberString(input: string, fallback: string) {
    if (input === "") return fallback;

    const n = Number(input);
    if (!Number.isFinite(n)) return fallback;

    // ไม่ clamp ไม่แก้ค่าติดลบ (เพราะ Option A ให้ validation คุม)
    return String(n);
  }
}
