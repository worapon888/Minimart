import {
  BadRequestException,
  Body,
  Controller,
  Get,
  MethodNotAllowedException,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import {
  DailyRangeQueryDto,
  DashboardListQueryDto,
  DevSampleQueryDto,
  ReportSummaryQueryDto,
  TopProductsQueryDto,
} from "./dto/dashboard.dto";
import { RangeLimitGuard } from "./guards/range-limit.guard";

import { Audit } from "../../common/audit/audit.decorator";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  private ensureDevOnly() {
    const allowInProd = process.env.ALLOW_DEMO_DATA_MUTATION === "true";
    if (process.env.NODE_ENV === "production" && !allowInProd) {
      throw new MethodNotAllowedException(
        "Demo seed/cleanup endpoints are disabled in production (set ALLOW_DEMO_DATA_MUTATION=true to enable)",
      );
    }
  }

  @Get("daily")
  @UseGuards(new RangeLimitGuard(90))
  @Audit({ action: "DASHBOARD_DAILY", entity: "DailySales" }) // ✅ เพิ่ม
  async daily(@Query() q: DailyRangeQueryDto) {
    return this.svc.getDailyRange(q.from, q.to);
  }

  @Get("top-products")
  @Audit({ action: "DASHBOARD_TOP", entity: "TopProduct" }) // ✅ เพิ่ม
  async top(@Query() q: TopProductsQueryDto) {
    return this.svc.getTopProducts(q.window, q.limit ?? 10);
  }

  @Get("orders")
  @Audit({ action: "DASHBOARD_ORDERS", entity: "Order" })
  async orders(@Query() q: DashboardListQueryDto) {
    return this.svc.listOrders(q.limit ?? 50, q.offset ?? 0);
  }

  @Get("inventory")
  @Audit({ action: "DASHBOARD_INVENTORY", entity: "Inventory" })
  async inventory(@Query() q: DashboardListQueryDto) {
    return this.svc.listInventory(q.limit ?? 50, q.offset ?? 0);
  }

  @Get("customers")
  @Audit({ action: "DASHBOARD_CUSTOMERS", entity: "User" })
  async customers(@Query() q: DashboardListQueryDto) {
    return this.svc.listCustomers(q.limit ?? 50, q.offset ?? 0);
  }

  @Get("reports/summary")
  @Audit({ action: "DASHBOARD_REPORTS", entity: "DailySales" })
  async reportsSummary(@Query() q: ReportSummaryQueryDto) {
    const days = q.days ?? 30;
    if (days < 7 || days > 90) {
      throw new BadRequestException("days must be between 7 and 90");
    }
    return this.svc.getReportSummary(days);
  }

  @Post("dev/seed")
  async seedDemo(@Body() q: DevSampleQueryDto) {
    this.ensureDevOnly();
    return this.svc.seedSamplePaidOrders(q.count ?? 2);
  }

  @Post("dev/cleanup")
  async cleanupDemo(@Body() q: DevSampleQueryDto) {
    this.ensureDevOnly();
    return this.svc.cleanupSamplePaidOrders(q.count ?? 2);
  }
}
