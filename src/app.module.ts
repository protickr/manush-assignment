import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { RedisModule } from '@cache/redis.module';
import redisConfig from '@config/redis.config';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
    }),
    RedisModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
