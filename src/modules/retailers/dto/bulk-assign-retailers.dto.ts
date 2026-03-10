import { IsArray, IsUUID } from 'class-validator';

export class BulkAssignRetailersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  retailerIds!: string[];

  @IsUUID()
  srId!: string;
}
