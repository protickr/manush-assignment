import { Module } from '@nestjs/common';
import { PrismaModule } from '@database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { RedisModule } from '@cache/redis.module';
import redisConfig from '@config/redis.config';
import serverConfig from '@config/server.config';
import { GlobalExceptionFilter } from '@common/global-exception.filter';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { LocationsModule } from './modules/locations/locations.module';
import { DistributorsModule } from './modules/distributors/distributors.module';
import { RetailersModule } from './modules/retailers/retailers.module';
import jwtConfig from '@config/jwt.config';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, serverConfig, jwtConfig],
    }),
    RedisModule,
    PrismaModule,

    // application modules
    UsersModule,
    AuthModule,
    LocationsModule,
    DistributorsModule,
    RetailersModule,
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
