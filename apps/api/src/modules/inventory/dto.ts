import { IsInt, IsPositive, IsString } from "class-validator";

export class StockBodyDto {
  @IsString()
  productId!: string;

  @IsInt()
  @IsPositive()
  qty!: number;
}
