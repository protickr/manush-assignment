import { Test, TestingModule } from '@nestjs/testing';
import { TerritoriesController } from './territories.controller';

describe('TerritoriesController', () => {
  let controller: TerritoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TerritoriesController],
    }).compile();

    controller = module.get<TerritoriesController>(TerritoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
