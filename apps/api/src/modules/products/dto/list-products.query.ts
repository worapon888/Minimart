import { IsInt, IsOptional, IsString, Min, Max, Length } from "class-validator";

export class ListProductsQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  search?: string;

  @IsOptional()
  @IsString()
  @Length(1, 40)
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 24;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
