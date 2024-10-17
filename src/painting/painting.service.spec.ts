import { Test, TestingModule } from '@nestjs/testing';
import { PaintingService } from './painting.service';

describe('PaintingService', () => {
  let service: PaintingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaintingService],
    }).compile();

    service = module.get<PaintingService>(PaintingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
