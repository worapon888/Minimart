import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from "class-validator";

export class CreateProductDto {
  @IsString()
  @Length(2, 120)
  title!: string;

  @IsString()
  @Length(2, 64)
  @Matches(/^[A-Za-z0-9._-]+$/)
  sku!: string;

  @IsInt()
  @Min(1)
  priceCents!: number;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  category?: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000000)
  thumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
