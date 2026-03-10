import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';

@Injectable()
export class DistributorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDistributorDto) {
    return this.prisma.distributor.create({ data: dto });
  }

  async findAll() {
    return this.prisma.distributor.findMany();
  }

  async findOne(id: string) {
    const distributor = await this.prisma.distributor.findUnique({
      where: { id },
    });
    if (!distributor) throw new NotFoundException('Distributor not found');
    return distributor;
  }

  async update(id: string, dto: UpdateDistributorDto) {
    await this.findOne(id);
    return this.prisma.distributor.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.distributor.delete({ where: { id } });
  }
}
