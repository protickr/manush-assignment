import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RedisService } from '../../cache/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// bcrypt may lack types; require for safety
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const bcrypt = require('bcryptjs');

@Injectable()
export class UsersService {
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private usersRepository: UsersRepository,
    private redisService: RedisService,
  ) {}

  async findAll() {
    return this.usersRepository.findAll();
  }

  async findById(id: string) {
    const cacheKey = `user:${id}`;

    // Try to get from cache
    const cachedUser = await this.redisService.get(cacheKey);
    if (cachedUser) {
      return JSON.parse(cachedUser) as any;
    }

    // If not in cache, fetch from database
    const user = await this.usersRepository.findById(id);

    // Store in cache
    await this.redisService.set(cacheKey, user, this.CACHE_TTL);

    return user;
  }

  async findByPhone(phone: string) {
    const cacheKey = `user:phone:${phone}`;

    // Try to get from cache
    const cachedUser = await this.redisService.get(cacheKey);
    if (cachedUser) {
      return JSON.parse(cachedUser) as any;
    }

    // If not in cache, fetch from database
    const user = await this.usersRepository.findByPhone(phone);

    // Store in cache if user exists
    if (user) {
      await this.redisService.set(cacheKey, user, this.CACHE_TTL);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.create(createUserDto);

    // Invalidate all users cache
    await this.redisService.del('users:all');

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.update(id, updateUserDto);

    // Invalidate user cache
    await this.redisService.del(`user:${id}`);
    await this.redisService.del('users:all');

    return user;
  }

  async remove(id: string) {
    const user = await this.usersRepository.remove(id);

    // Invalidate user cache
    await this.redisService.del(`user:${id}`);
    await this.redisService.del('users:all');

    return user;
  }
}
