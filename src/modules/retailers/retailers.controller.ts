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
import { RetailersService } from './retailers.service';
import { CreateRetailerDto } from './dto/create-retailer.dto';
import { UpdateRetailerDto } from './dto/update-retailer.dto';
import { SrUpdateRetailerDto } from './dto/sr-update-retailer.dto';
import { BulkAssignRetailersDto } from './dto/bulk-assign-retailers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('retailers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RetailersController {
  constructor(private readonly retailersService: RetailersService) {}

  // ─── Admin Endpoints ──────────────────────────────────────

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateRetailerDto) {
    return this.retailersService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SALES_REPRESENTATIVE)
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
  findOne(@Param('id') id: string) {
    return this.retailersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateRetailerDto) {
    return this.retailersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.retailersService.remove(id);
  }

  // ─── SR Update (restricted fields) ────────────────────────

  @Patch(':id/sr-update')
  @Roles(Role.SALES_REPRESENTATIVE)
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
  bulkAssign(@Body() dto: BulkAssignRetailersDto) {
    return this.retailersService.bulkAssign(dto.retailerIds, dto.srId);
  }

  @Post('bulk-unassign')
  @Roles(Role.ADMIN)
  bulkUnassign(@Body('retailerIds') retailerIds: string[]) {
    return this.retailersService.bulkUnassign(retailerIds);
  }

  // ─── Admin CSV Import ─────────────────────────────────────

  @Post('import-csv')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  importCsv(@UploadedFile() file: any) {
    return this.retailersService.importCsv(file.buffer as Buffer);
  }
}
