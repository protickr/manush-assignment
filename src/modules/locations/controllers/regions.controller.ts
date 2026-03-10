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
import { CreateRegionDto } from '../dto/create-region.dto';
import { UpdateRegionDto } from '../dto/update-region.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Regions')
@ApiBearerAuth()
@Controller('regions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class RegionsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a region' })
  @ApiResponse({ status: 201, description: 'Region created' })
  create(@Body() dto: CreateRegionDto) {
    return this.locationsService.createRegion(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all regions' })
  findAll() {
    return this.locationsService.findAllRegions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a region by ID' })
  @ApiParam({ name: 'id', description: 'Region UUID' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findRegionById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a region' })
  @ApiParam({ name: 'id', description: 'Region UUID' })
  update(@Param('id') id: string, @Body() dto: UpdateRegionDto) {
    return this.locationsService.updateRegion(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a region' })
  @ApiParam({ name: 'id', description: 'Region UUID' })
  remove(@Param('id') id: string) {
    return this.locationsService.removeRegion(id);
  }
}
