import {
  IsString,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsPhoneNumber(null)
  phone: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @MinLength(6)
  password?: string;
}
