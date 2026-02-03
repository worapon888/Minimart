import { IsOptional, IsString, MinLength } from "class-validator";

export class StartCheckoutDto {
  @IsString()
  reservationId!: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  idempotencyKey?: string;
}
