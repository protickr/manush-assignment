import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Regions ──────────────────────────────────────────────

  async createRegion(dto: CreateRegionDto) {
    return this.prisma.region.create({ data: dto });
  }

  async findAllRegions() {
    return this.prisma.region.findMany({ include: { areas: true } });
  }

  async findRegionById(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: { areas: { include: { territories: true } } },
    });
    if (!region) throw new NotFoundException('Region not found');
    return region;
  }

  async updateRegion(id: string, dto: UpdateRegionDto) {
    await this.findRegionById(id);
    return this.prisma.region.update({ where: { id }, data: dto });
  }

  async removeRegion(id: string) {
    await this.findRegionById(id);
    return this.prisma.region.delete({ where: { id } });
  }

  // ─── Areas ────────────────────────────────────────────────

  async createArea(dto: CreateAreaDto) {
    // Validate parent region exists
    await this.findRegionById(dto.regionId);
    return this.prisma.area.create({ data: dto });
  }

  async findAllAreas() {
    return this.prisma.area.findMany({
      include: { region: true, territories: true },
    });
  }

  async findAreaById(id: string) {
    const area = await this.prisma.area.findUnique({
      where: { id },
      include: { region: true, territories: true },
    });
    if (!area) throw new NotFoundException('Area not found');
    return area;
  }

  async updateArea(id: string, dto: UpdateAreaDto) {
    await this.findAreaById(id);
    if (dto.regionId) await this.findRegionById(dto.regionId);
    return this.prisma.area.update({ where: { id }, data: dto });
  }

  async removeArea(id: string) {
    await this.findAreaById(id);
    return this.prisma.area.delete({ where: { id } });
  }

  // ─── Territories ──────────────────────────────────────────

  async createTerritory(dto: CreateTerritoryDto) {
    // Validate parent area exists
    await this.findAreaById(dto.areaId);
    return this.prisma.territory.create({ data: dto });
  }

  async findAllTerritories() {
    return this.prisma.territory.findMany({
      include: { area: { include: { region: true } } },
    });
  }

  async findTerritoryById(id: string) {
    const territory = await this.prisma.territory.findUnique({
      where: { id },
      include: { area: { include: { region: true } } },
    });
    if (!territory) throw new NotFoundException('Territory not found');
    return territory;
  }

  async updateTerritory(id: string, dto: UpdateTerritoryDto) {
    await this.findTerritoryById(id);
    if (dto.areaId) await this.findAreaById(dto.areaId);
    return this.prisma.territory.update({ where: { id }, data: dto });
  }

  async removeTerritory(id: string) {
    await this.findTerritoryById(id);
    return this.prisma.territory.delete({ where: { id } });
  }
}
