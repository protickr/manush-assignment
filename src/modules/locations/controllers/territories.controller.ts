import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LocationsService } from '../locations.service';
import { CreateTerritoryDto } from '../dto/create-territory.dto';
import { UpdateTerritoryDto } from '../dto/update-territory.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('territories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class TerritoriesController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() dto: CreateTerritoryDto) {
    return this.locationsService.createTerritory(dto);
  }

  @Get()
  findAll() {
    return this.locationsService.findAllTerritories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findTerritoryById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTerritoryDto) {
    return this.locationsService.updateTerritory(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationsService.removeTerritory(id);
  }
}
