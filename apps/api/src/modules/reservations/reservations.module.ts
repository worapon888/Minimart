import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { ReservationsController } from "./reservations.controller";
import { ReservationsService } from "./reservations.service";
import { ReservationsCleanup } from "./reservations.cleanup";

@Module({
  imports: [PrismaModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsCleanup],
  exports: [ReservationsService],
})
export class ReservationsModule {}
