import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  qty!: number;
}

class ShippingDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s()]{8,20}$/)
  tel!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreateDirectOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingDto)
  shipping!: ShippingDto;

  @IsString()
  @MinLength(8)
  idempotencyKey!: string;
}
