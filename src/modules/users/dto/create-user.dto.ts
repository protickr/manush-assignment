import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @MinLength(6)
  password?: string;
}
