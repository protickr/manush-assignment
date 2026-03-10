import { IsString, IsUUID } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  name!: string;

  @IsUUID()
  regionId!: string;
}
