import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { DistributorsService } from './distributors.service';
import { DistributorsController } from './distributors.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DistributorsController],
  providers: [DistributorsService],
  exports: [DistributorsService],
})
export class DistributorsModule {}
