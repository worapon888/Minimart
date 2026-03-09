import { IsString, Length } from "class-validator";

export class IdParamDto {
  @IsString()
  @Length(1, 64)
  id!: string;
}
