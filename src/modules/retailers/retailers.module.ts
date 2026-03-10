import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { RetailersService } from './retailers.service';
import { RetailersController } from './retailers.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RetailersController],
  providers: [RetailersService],
  exports: [RetailersService],
})
export class RetailersModule {}
