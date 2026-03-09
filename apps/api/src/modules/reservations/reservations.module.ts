import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { ReservationsController } from "./reservations.controller";
import { ReservationsService } from "./reservations.service";
import { ReservationsReleaseJob } from "./job/reservations.release.job";
@Module({
  imports: [PrismaModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsReleaseJob],
  exports: [ReservationsService, ReservationsReleaseJob], // export job ด้วย เผื่อ test app.get()
})
export class ReservationsModule {}
