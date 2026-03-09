import { Module } from "@nestjs/common";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService], // ✅ เผื่อ module อื่นอยากเรียกใช้ service นี้
})
export class WebhooksModule {}
