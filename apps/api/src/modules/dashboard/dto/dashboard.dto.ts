import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsDate, Max, Min } from "class-validator";

export class DailyRangeQueryDto {
  @Type(() => Date)
  @IsDate()
  from!: Date;

  @Type(() => Date)
  @IsDate()
  to!: Date;
}

export enum TopWindowDto {
  D7 = "D7",
  D30 = "D30",
}

export class TopProductsQueryDto {
  @IsEnum(TopWindowDto)
  window!: TopWindowDto;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;
}

export class DevSampleQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  count?: number;
}

export class DashboardListQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  limit?: number = 50;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number = 0;
}

export class ReportSummaryQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(7)
  @Max(90)
  @IsOptional()
  days?: number = 30;
}
