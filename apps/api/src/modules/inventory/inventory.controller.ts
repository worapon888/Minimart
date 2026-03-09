import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { StockBodyDto } from "./dto";

@Controller("inventory")
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Get(":productId")
  get(@Param("productId") productId: string) {
    return this.svc.get(productId);
  }

  @Post("check")
  check(@Body() body: StockBodyDto) {
    return this.svc.checkStock(body.productId, body.qty);
  }

  @Post("decrement")
  decrement(@Body() body: StockBodyDto) {
    return this.svc.decrementOnHand(body.productId, body.qty);
  }

  @Post("increment")
  increment(@Body() body: StockBodyDto) {
    return this.svc.incrementOnHand(body.productId, body.qty);
  }
}
