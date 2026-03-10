import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';

export class CreateRetailerDto {
  @IsString()
  uid!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsString()
  routes?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsUUID()
  territoryId?: string;

  @IsOptional()
  @IsUUID()
  distributorId?: string;
}
