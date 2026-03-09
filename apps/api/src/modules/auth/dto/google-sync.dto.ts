import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class GoogleSyncDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
