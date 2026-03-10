import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('LocationsService', () => {
  let service: LocationsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      region: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      area: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      territory: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  // Test 1: Create a region
  it('should create a region', async () => {
    const dto = { name: 'Dhaka' };
    const expected = { id: 'r1', name: 'Dhaka' };
    prisma.region.create.mockResolvedValue(expected);

    const result = await service.createRegion(dto);
    expect(result).toEqual(expected);
    expect(prisma.region.create).toHaveBeenCalledWith({ data: dto });
  });

  // Test 2: findRegionById throws NotFoundException
  it('should throw NotFoundException for unknown region', async () => {
    prisma.region.findUnique.mockResolvedValue(null);
    await expect(service.findRegionById('bad-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  // Test 3: createArea validates parent region exists
  it('should throw NotFoundException when creating area with invalid regionId', async () => {
    prisma.region.findUnique.mockResolvedValue(null);
    await expect(
      service.createArea({ name: 'North', regionId: 'bad-region' }),
    ).rejects.toThrow(NotFoundException);
  });

  // Test 4: createTerritory validates parent area exists
  it('should throw NotFoundException when creating territory with invalid areaId', async () => {
    prisma.area.findUnique.mockResolvedValue(null);
    await expect(
      service.createTerritory({ name: 'Zone 1', areaId: 'bad-area' }),
    ).rejects.toThrow(NotFoundException);
  });

  // Test 5: findAllRegions returns list
  it('should return all regions', async () => {
    const regions = [
      { id: 'r1', name: 'Dhaka', areas: [] },
      { id: 'r2', name: 'Chittagong', areas: [] },
    ];
    prisma.region.findMany.mockResolvedValue(regions);

    const result = await service.findAllRegions();
    expect(result).toEqual(regions);
    expect(prisma.region.findMany).toHaveBeenCalledWith({
      include: { areas: true },
    });
  });
});
