import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    id: 'user-1',
    name: 'Test Admin',
    phone: '01700000000',
    role: Role.ADMIN,
    passwordHash: '', // will be set in beforeAll
    isActive: true,
    isMobileValid: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('admin123', 10);
  });

  beforeEach(async () => {
    usersService = {
      findByPhone: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // Test 1: validateUser returns user on valid credentials
  it('should return user for valid credentials', async () => {
    (usersService.findByPhone as jest.Mock).mockResolvedValue(mockUser);
    const result = await service.validateUser('01700000000', 'admin123');
    expect(result).toEqual(mockUser);
  });

  // Test 2: validateUser returns null for wrong password
  it('should return null for wrong password', async () => {
    (usersService.findByPhone as jest.Mock).mockResolvedValue(mockUser);
    const result = await service.validateUser('01700000000', 'wrongpass');
    expect(result).toBeNull();
  });

  // Test 3: validateUser returns null for non-existent user
  it('should return null if user not found', async () => {
    (usersService.findByPhone as jest.Mock).mockResolvedValue(null);
    const result = await service.validateUser('0199999999', 'any');
    expect(result).toBeNull();
  });

  // Test 4: validateUser rejects RETAILER role
  it('should return null for RETAILER role', async () => {
    const retailerUser = { ...mockUser, role: Role.RETAILER };
    (usersService.findByPhone as jest.Mock).mockResolvedValue(retailerUser);
    const result = await service.validateUser('01700000000', 'admin123');
    expect(result).toBeNull();
  });

  // Test 5: login returns access_token
  it('should return access_token on login', () => {
    const result = service.login(mockUser as any);
    expect(result).toEqual({ access_token: 'mock-jwt-token' });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: mockUser.id,
      role: mockUser.role,
    });
  });
});
