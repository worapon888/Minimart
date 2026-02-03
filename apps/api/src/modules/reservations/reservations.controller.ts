import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ReservationsService } from "./reservations.service";

type ReservationListMode = "ACTIVE" | "ALL";

@Controller("flashsale")
export class ReservationsController {
  constructor(private readonly service: ReservationsService) {}

  // ✅ MUST be above :productId routes (ไม่งั้นโดน :productId จับ)
  @Get("_debug/items")
  debugItems() {
    return this.service.debugListItems();
  }

  @Get(":productId")
  getItem(@Param("productId") productId: string) {
    return this.service.getItem(productId);
  }

  @Get(":productId/reservations")
  listReservations(
    @Param("productId") productId: string,
    @Query("status") status?: ReservationListMode,
  ) {
    const mode: ReservationListMode = status === "ALL" ? "ALL" : "ACTIVE";
    return this.service.listReservations(productId, mode);
  }

  @Post(":productId/reserve")
  reserve(
    @Param("productId") productId: string,
    @Body() body: { qty: number; requestId?: string },
  ) {
    return this.service.reserve(productId, body.qty, body.requestId);
  }
}
