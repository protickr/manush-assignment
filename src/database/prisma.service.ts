import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      // @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.$connect();
      this.logger.log('Database connected successfully.');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
    }
  }

  async onModuleDestroy() {
    // @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.$disconnect();
    this.logger.log('Database connection closed.');
  }
}
