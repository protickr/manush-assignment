import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { LocationsService } from './locations.service';
import { RegionsController } from './controllers/regions.controller';
import { AreasController } from './controllers/areas.controller';
import { TerritoriesController } from './controllers/territories.controller';

@Module({
  imports: [PrismaModule],
  providers: [LocationsService],
  controllers: [RegionsController, AreasController, TerritoriesController],
  exports: [LocationsService],
})
export class LocationsModule {}
