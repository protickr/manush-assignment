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
import { CreateAreaDto } from '../dto/create-area.dto';
import { UpdateAreaDto } from '../dto/update-area.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AreasController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() dto: CreateAreaDto) {
    return this.locationsService.createArea(dto);
  }

  @Get()
  findAll() {
    return this.locationsService.findAllAreas();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findAreaById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    return this.locationsService.updateArea(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationsService.removeArea(id);
  }
}
