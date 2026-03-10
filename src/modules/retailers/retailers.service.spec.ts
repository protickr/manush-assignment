import { Test, TestingModule } from '@nestjs/testing';
import { RetailersService } from './retailers.service';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../cache/redis.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RetailersService', () => {
  let service: RetailersService;
  let prisma: any;
  let redis: any;

  const mockRetailer = {
    id: 'ret-1',
    uid: 'R00001',
    name: 'Test Retailer',
    phone: '01900000001',
    points: 100,
    routes: 'Route-1',
    notes: null,
    regionId: 'r1',
    areaId: 'a1',
    territoryId: 't1',
    distributorId: 'd1',
    assignedSrId: 'sr-1',
    region: { id: 'r1', name: 'Dhaka' },
    area: { id: 'a1', name: 'Dhaka North' },
    territory: { id: 't1', name: 'Zone 1' },
    distributor: { id: 'd1', name: 'ABC' },
    assignedSr: { id: 'sr-1', name: 'SR Karim', phone: '01711111111' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      retailer: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
        createMany: jest.fn(),
      },
      territory: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      area: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetailersService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<RetailersService>(RetailersService);
  });

  // Test 1: findOne returns cached retailer
  it('should return cached retailer from Redis', async () => {
    redis.get.mockResolvedValue(JSON.stringify(mockRetailer));
    const result = await service.findOne('ret-1');
    // Dates become strings after JSON serialization round-trip
    expect(result).toEqual(JSON.parse(JSON.stringify(mockRetailer)));
    expect(prisma.retailer.findUnique).not.toHaveBeenCalled();
  });

  // Test 2: findOne fetches from DB and caches on cache miss
  it('should fetch from DB on cache miss and cache result', async () => {
    redis.get.mockResolvedValue(null);
    prisma.retailer.findUnique.mockResolvedValue(mockRetailer);

    const result = await service.findOne('ret-1');
    expect(result).toEqual(mockRetailer);
    expect(redis.set).toHaveBeenCalledWith(
      'retailer:ret-1',
      mockRetailer,
      3600,
    );
  });

  // Test 3: findOne throws NotFoundException
  it('should throw NotFoundException for unknown retailer', async () => {
    redis.get.mockResolvedValue(null);
    prisma.retailer.findUnique.mockResolvedValue(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

  // Test 4: srUpdateRetailer rejects update for non-assigned SR
  it('should reject SR updating a non-assigned retailer', async () => {
    redis.get.mockResolvedValue(null);
    prisma.retailer.findUnique.mockResolvedValue(mockRetailer);

    await expect(
      service.srUpdateRetailer('ret-1', 'different-sr', { points: 200 }),
    ).rejects.toThrow(BadRequestException);
  });

  // Test 5: bulkAssign updates and invalidates cache
  it('should bulk assign retailers and invalidate cache', async () => {
    prisma.retailer.updateMany.mockResolvedValue({ count: 2 });
    const result = await service.bulkAssign(['ret-1', 'ret-2'], 'sr-1');
    expect(result).toEqual({ count: 2 });
    expect(redis.del).toHaveBeenCalledWith('retailer:ret-1');
    expect(redis.del).toHaveBeenCalledWith('retailer:ret-2');
  });
});
