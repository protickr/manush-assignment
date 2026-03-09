import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client!: Redis;

  constructor(private config: ConfigService) {} // Inject ConfigService

  onModuleInit() {
    this.client = new Redis({
      host: this.config.get('redis.host'),
      port: Number(this.config.get('redis.port')),
    });

    this.client.on('connect', () => {
      // this.logger.log('Connected to Redis');
      console.log('Connected to Redis');
    });

    this.client.on('error', (error) => {
      // this.logger.error(`Redis connection error: ${error.message}`);
      console.error(`Redis connection error: ${error.message}`);
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: any, ttl?: number) {
    const val = JSON.stringify(value);

    if (ttl) {
      await this.client.set(key, val, 'EX', ttl);
    } else {
      await this.client.set(key, val);
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
