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
import { CreateAreaDto } from '../dto/create-area.dto';
import { UpdateAreaDto } from '../dto/update-area.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Areas')
@ApiBearerAuth()
@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AreasController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an area' })
  @ApiResponse({ status: 201, description: 'Area created' })
  create(@Body() dto: CreateAreaDto) {
    return this.locationsService.createArea(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all areas' })
  findAll() {
    return this.locationsService.findAllAreas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an area by ID' })
  @ApiParam({ name: 'id', description: 'Area UUID' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findAreaById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an area' })
  @ApiParam({ name: 'id', description: 'Area UUID' })
  update(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    return this.locationsService.updateArea(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an area' })
  @ApiParam({ name: 'id', description: 'Area UUID' })
  remove(@Param('id') id: string) {
    return this.locationsService.removeArea(id);
  }
}
