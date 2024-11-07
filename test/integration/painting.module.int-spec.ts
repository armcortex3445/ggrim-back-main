import { Test, TestingModule } from '@nestjs/testing';
import { PaintingService } from '../../src/painting/painting.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Painting } from '../../src/painting/entities/painting.entity';
import { WikiArtPainting } from '../../src/painting/entities/wikiArt-painting.entity';
import { MockRepository } from '../_shared/mock/mock.repository';
import { TypeormConfig } from '../../src/utils/typeorm.config';
import { DataSource, DataSourceOptions, Repository, createConnections } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { CreatePaintingDto } from '../../src/painting/dto/create-painting.dto';
import { createConnection } from 'net';
import { PaintingModule } from '../../src/painting/painting.module';
import { TestService } from '../_shared/test.service';
import { TestModule } from '../_shared/test.module';

describe('PaintingModule Integration Test', () => {
  let module: TestingModule;
  let paintingService: PaintingService;
  let testService: TestService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule, PaintingModule],
    }).compile();

    paintingService = module.get<PaintingService>(PaintingService);
    testService = module.get<TestService>(TestService);
    await testService.initTest();
  });

  afterAll(async () => {
    await testService.cleanAll();
    await testService.closeTest();
  });

  it('should be defined', () => {
    expect(paintingService).toBeDefined();
  });

  it('should success create', () => {
    const dto: CreatePaintingDto = {
      title: 'unit-test',
    };
    paintingService.create(dto);
  });

  it('should success create', () => {
    const dto: CreatePaintingDto = {
      title: 'unit-test',
    };
    paintingService.create(dto);
  });
});
