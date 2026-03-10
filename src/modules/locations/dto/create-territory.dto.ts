import { IsString, IsUUID } from 'class-validator';

export class CreateTerritoryDto {
  @IsString()
  name!: string;

  @IsUUID()
  areaId!: string;
}
