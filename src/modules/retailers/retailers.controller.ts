import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { RetailersService } from './retailers.service';
import { CreateRetailerDto } from './dto/create-retailer.dto';
import { UpdateRetailerDto } from './dto/update-retailer.dto';
import { SrUpdateRetailerDto } from './dto/sr-update-retailer.dto';
import { BulkAssignRetailersDto } from './dto/bulk-assign-retailers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Retailers')
@ApiBearerAuth()
@Controller('retailers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RetailersController {
  constructor(private readonly retailersService: RetailersService) {}

  // ─── Admin Endpoints ──────────────────────────────────────

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a retailer (Admin)' })
  @ApiResponse({ status: 201, description: 'Retailer created' })
  create(@Body() dto: CreateRetailerDto) {
    return this.retailersService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SALES_REPRESENTATIVE)
  @ApiOperation({ summary: 'List retailers (paginated, filterable)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name/uid/phone' })
  @ApiQuery({ name: 'regionId', required: false })
  @ApiQuery({ name: 'areaId', required: false })
  @ApiQuery({ name: 'territoryId', required: false })
  @ApiQuery({ name: 'distributorId', required: false })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('regionId') regionId?: string,
    @Query('areaId') areaId?: string,
    @Query('territoryId') territoryId?: string,
    @Query('distributorId') distributorId?: string,
  ) {
    return this.retailersService.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      regionId,
      areaId,
      territoryId,
      distributorId,
    });
  }

  @Get('my')
  @Roles(Role.SALES_REPRESENTATIVE)
  @ApiOperation({ summary: 'List only assigned retailers (SR)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'regionId', required: false })
  @ApiQuery({ name: 'areaId', required: false })
  @ApiQuery({ name: 'territoryId', required: false })
  @ApiQuery({ name: 'distributorId', required: false })
  findMyRetailers(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('regionId') regionId?: string,
    @Query('areaId') areaId?: string,
    @Query('territoryId') territoryId?: string,
    @Query('distributorId') distributorId?: string,
  ) {
    return this.retailersService.findAssignedRetailers(req.user.id, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      regionId,
      areaId,
      territoryId,
      distributorId,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SALES_REPRESENTATIVE)
  @ApiOperation({ summary: 'Get retailer details' })
  @ApiParam({ name: 'id', description: 'Retailer UUID' })
  findOne(@Param('id') id: string) {
    return this.retailersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a retailer (Admin — all fields)' })
  @ApiParam({ name: 'id', description: 'Retailer UUID' })
  update(@Param('id') id: string, @Body() dto: UpdateRetailerDto) {
    return this.retailersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a retailer (Admin)' })
  @ApiParam({ name: 'id', description: 'Retailer UUID' })
  remove(@Param('id') id: string) {
    return this.retailersService.remove(id);
  }

  // ─── SR Update (restricted fields) ────────────────────────

  @Patch(':id/sr-update')
  @Roles(Role.SALES_REPRESENTATIVE)
  @ApiOperation({ summary: 'Update retailer (SR — Points, Routes, Notes only)' })
  @ApiParam({ name: 'id', description: 'Retailer UUID' })
  srUpdate(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: SrUpdateRetailerDto,
  ) {
    return this.retailersService.srUpdateRetailer(id, req.user.id, dto);
  }

  // ─── Admin Bulk Assign / Unassign ─────────────────────────

  @Post('bulk-assign')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Bulk assign retailers to an SR (Admin)' })
  bulkAssign(@Body() dto: BulkAssignRetailersDto) {
    return this.retailersService.bulkAssign(dto.retailerIds, dto.srId);
  }

  @Post('bulk-unassign')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Bulk unassign retailers (Admin)' })
  @ApiBody({ schema: { properties: { retailerIds: { type: 'array', items: { type: 'string' } } } } })
  bulkUnassign(@Body('retailerIds') retailerIds: string[]) {
    return this.retailersService.bulkUnassign(retailerIds);
  }

  // ─── Admin CSV Import ─────────────────────────────────────

  @Post('import-csv')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Bulk import retailers from CSV (Admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  importCsv(@UploadedFile() file: any) {
    return this.retailersService.importCsv(file.buffer as Buffer);
  }
}
