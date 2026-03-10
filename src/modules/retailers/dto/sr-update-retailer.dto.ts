import { IsOptional, IsString, IsInt, Min } from 'class-validator';

/**
 * Fields that a Sales Representative is allowed to update.
 */
export class SrUpdateRetailerDto {
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
}
