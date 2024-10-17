import { Test, TestingModule } from '@nestjs/testing';
import { PaintingController } from './painting.controller';
import { PaintingService } from './painting.service';

describe('PaintingController', () => {
  let controller: PaintingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaintingController],
      providers: [PaintingService],
    }).compile();

    controller = module.get<PaintingController>(PaintingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
