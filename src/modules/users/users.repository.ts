import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// bcrypt types sometimes aren't installed; require to avoid TS errors
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const bcrypt = require('bcryptjs');

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByPhone(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    let passwordHash: string | undefined = undefined;

    if (createUserDto.password) {
      passwordHash = await bcrypt.hash(createUserDto.password, 10);
    }

    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        phone: createUserDto.phone,
        role: createUserDto.role,
        passwordHash,
      } as any,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findById(id);
    let data: any = { ...updateUserDto };

    if (updateUserDto.password) {
      data.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
