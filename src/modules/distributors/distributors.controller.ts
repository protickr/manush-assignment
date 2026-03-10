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
import { DistributorsService } from './distributors.service';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Distributors')
@ApiBearerAuth()
@Controller('distributors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a distributor' })
  @ApiResponse({ status: 201, description: 'Distributor created' })
  create(@Body() dto: CreateDistributorDto) {
    return this.distributorsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all distributors' })
  findAll() {
    return this.distributorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a distributor by ID' })
  @ApiParam({ name: 'id', description: 'Distributor UUID' })
  findOne(@Param('id') id: string) {
    return this.distributorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a distributor' })
  @ApiParam({ name: 'id', description: 'Distributor UUID' })
  update(@Param('id') id: string, @Body() dto: UpdateDistributorDto) {
    return this.distributorsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a distributor' })
  @ApiParam({ name: 'id', description: 'Distributor UUID' })
  remove(@Param('id') id: string) {
    return this.distributorsService.remove(id);
  }
}
