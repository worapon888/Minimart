import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [PaymentsService],
  exports: [PaymentsService], // ✅ สำคัญ: export ให้ module อื่นใช้ได้
})
export class PaymentsModule {}
