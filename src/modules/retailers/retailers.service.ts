import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../cache/redis.service';
import { CreateRetailerDto } from './dto/create-retailer.dto';
import { UpdateRetailerDto } from './dto/update-retailer.dto';
import { SrUpdateRetailerDto } from './dto/sr-update-retailer.dto';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

const BATCH_SIZE = 1000;
const CACHE_TTL = 3600; // 1 hour

@Injectable()
export class RetailersService {
  private readonly logger = new Logger(RetailersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Resolve the full hierarchy when only the most specific ID is provided.
   * E.g. if territoryId is given, auto-fill areaId and regionId.
   */
  private async resolveHierarchy(data: {
    regionId?: string;
    areaId?: string;
    territoryId?: string;
  }) {
    if (data.territoryId) {
      const territory = await this.prisma.territory.findUnique({
        where: { id: data.territoryId },
        include: { area: { include: { region: true } } },
      });
      if (!territory)
        throw new NotFoundException(
          `Territory ${data.territoryId} not found`,
        );
      data.areaId = territory.areaId;
      data.regionId = territory.area.regionId;
    } else if (data.areaId) {
      const area = await this.prisma.area.findUnique({
        where: { id: data.areaId },
        include: { region: true },
      });
      if (!area)
        throw new NotFoundException(`Area ${data.areaId} not found`);
      data.regionId = area.regionId;
    }
    return data;
  }

  // ─── Admin CRUD ───────────────────────────────────────────

  async create(dto: CreateRetailerDto) {
    const resolved = await this.resolveHierarchy(dto);
    return this.prisma.retailer.create({ data: { ...dto, ...resolved } });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    regionId?: string;
    areaId?: string;
    territoryId?: string;
    distributorId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.regionId) where.regionId = query.regionId;
    if (query.areaId) where.areaId = query.areaId;
    if (query.territoryId) where.territoryId = query.territoryId;
    if (query.distributorId) where.distributorId = query.distributorId;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { uid: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.retailer.findMany({
        where,
        skip,
        take: limit,
        include: {
          region: true,
          area: true,
          territory: true,
          distributor: true,
          assignedSr: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.retailer.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    // Check cache first
    const cacheKey = `retailer:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const retailer = await this.prisma.retailer.findUnique({
      where: { id },
      include: {
        region: true,
        area: true,
        territory: true,
        distributor: true,
        assignedSr: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!retailer) throw new NotFoundException('Retailer not found');

    await this.redis.set(cacheKey, retailer, CACHE_TTL);
    return retailer;
  }

  private async invalidateRetailerCache(id: string) {
    await this.redis.del(`retailer:${id}`);
  }

  async update(id: string, dto: UpdateRetailerDto) {
    await this.findOne(id);
    const resolved = await this.resolveHierarchy(dto);
    const updated = await this.prisma.retailer.update({
      where: { id },
      data: { ...dto, ...resolved },
    });
    await this.invalidateRetailerCache(id);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    const deleted = await this.prisma.retailer.delete({ where: { id } });
    await this.invalidateRetailerCache(id);
    return deleted;
  }

  // ─── SR-specific ──────────────────────────────────────────

  async findAssignedRetailers(
    srId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      regionId?: string;
      areaId?: string;
      territoryId?: string;
      distributorId?: string;
    },
  ) {
    return this.findAll({ ...query, ...{ assignedSrId: srId } as any });
  }

  async srUpdateRetailer(
    retailerId: string,
    srId: string,
    dto: SrUpdateRetailerDto,
  ) {
    const retailer = await this.findOne(retailerId);
    if (retailer.assignedSrId !== srId) {
      throw new BadRequestException(
        'You can only update retailers assigned to you',
      );
    }
    const updated = await this.prisma.retailer.update({
      where: { id: retailerId },
      data: dto,
    });
    await this.invalidateRetailerCache(retailerId);
    return updated;
  }

  // ─── Bulk Assign / Unassign ───────────────────────────────

  async bulkAssign(retailerIds: string[], srId: string) {
    const result = await this.prisma.retailer.updateMany({
      where: { id: { in: retailerIds } },
      data: { assignedSrId: srId },
    });
    await Promise.all(retailerIds.map((id) => this.invalidateRetailerCache(id)));
    return result;
  }

  async bulkUnassign(retailerIds: string[]) {
    const result = await this.prisma.retailer.updateMany({
      where: { id: { in: retailerIds } },
      data: { assignedSrId: null },
    });
    await Promise.all(retailerIds.map((id) => this.invalidateRetailerCache(id)));
    return result;
  }

  // ─── CSV Bulk Import ─────────────────────────────────────

  async importCsv(fileBuffer: Buffer) {
    // 1. Pre-load geography cache for fast hierarchy resolution
    const territories = await this.prisma.territory.findMany({
      include: { area: true },
    });
    const areas = await this.prisma.area.findMany();

    const territoryMap = new Map(
      territories.map((t) => [
        t.id,
        { areaId: t.areaId, regionId: t.area.regionId },
      ]),
    );
    const areaMap = new Map(
      areas.map((a) => [a.id, { regionId: a.regionId }]),
    );

    // 2. Stream-parse the CSV
    const rows: any[] = [];
    const errors: { row: number; error: string }[] = [];
    let rowIndex = 0;
    let importedCount = 0;

    return new Promise<{ importedCount: number; errors: typeof errors }>(
      (resolve, reject) => {
        const stream = Readable.from(fileBuffer.toString());

        stream
          .pipe(csvParser())
          .on('data', (row: any) => {
            rowIndex++;
            try {
              const record: any = {
                uid: row.uid,
                name: row.name,
                phone: row.phone || null,
                points: row.points ? parseInt(row.points, 10) : 0,
                routes: row.routes || null,
                notes: row.notes || null,
                distributorId: row.distributor_id || null,
                territoryId: row.territory_id || null,
                areaId: row.area_id || null,
                regionId: row.region_id || null,
              };

              // Resolve hierarchy from cache
              if (record.territoryId && territoryMap.has(record.territoryId)) {
                const t = territoryMap.get(record.territoryId)!;
                record.areaId = t.areaId;
                record.regionId = t.regionId;
              } else if (record.areaId && areaMap.has(record.areaId)) {
                const a = areaMap.get(record.areaId)!;
                record.regionId = a.regionId;
              }

              if (!record.uid || !record.name) {
                errors.push({
                  row: rowIndex,
                  error: 'Missing required uid or name',
                });
                return;
              }

              rows.push(record);
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : String(e);
              errors.push({ row: rowIndex, error: message });
            }
          })
          .on('end', async () => {
            // 3. Batch insert
            try {
              for (let i = 0; i < rows.length; i += BATCH_SIZE) {
                const batch = rows.slice(i, i + BATCH_SIZE);
                const result = await this.prisma.retailer.createMany({
                  data: batch,
                  skipDuplicates: true,
                });
                importedCount += result.count;
              }
              this.logger.log(
                `CSV import complete: ${importedCount} imported, ${errors.length} errors`,
              );
              resolve({ importedCount, errors });
            } catch (e) {
              reject(e);
            }
          })
          .on('error', (err: Error) => reject(err));
      },
    );
  }
}
