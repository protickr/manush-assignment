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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { LocationsService } from '../locations.service';
import { CreateTerritoryDto } from '../dto/create-territory.dto';
import { UpdateTerritoryDto } from '../dto/update-territory.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Territories')
@ApiBearerAuth()
@Controller('territories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class TerritoriesController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a territory' })
  @ApiResponse({ status: 201, description: 'Territory created' })
  create(@Body() dto: CreateTerritoryDto) {
    return this.locationsService.createTerritory(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all territories' })
  findAll() {
    return this.locationsService.findAllTerritories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a territory by ID' })
  @ApiParam({ name: 'id', description: 'Territory UUID' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findTerritoryById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a territory' })
  @ApiParam({ name: 'id', description: 'Territory UUID' })
  update(@Param('id') id: string, @Body() dto: UpdateTerritoryDto) {
    return this.locationsService.updateTerritory(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a territory' })
  @ApiParam({ name: 'id', description: 'Territory UUID' })
  remove(@Param('id') id: string) {
    return this.locationsService.removeTerritory(id);
  }
}
