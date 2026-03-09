import { Module } from '@nestjs/common';
import { PrismaModule } from '@database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { RedisModule } from '@cache/redis.module';
import redisConfig from '@config/redis.config';
import serverConfig from '@config/server.config';
import { GlobalExceptionFilter } from '@common/global-exception.filter';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, serverConfig],
    }),
    RedisModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
