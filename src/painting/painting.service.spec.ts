import { Test, TestingModule } from '@nestjs/testing';
import { PaintingService } from './painting.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Painting } from './entities/painting.entity';
import { WikiArtPainting } from './entities/wikiArt-painting.entity';
import { MockRepository } from '../../test/_shared/mock/mock.repository';
import { TypeormConfig } from '../utils/typeorm.config';
import { DataSource, DataSourceOptions, Repository, createConnections } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { CreatePaintingDto } from './dto/create-painting.dto';
import { createConnection } from 'net';

describe('PaintingService', () => {
  let service: PaintingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test.local',
        }),
      ],
      providers: [
        PaintingService,
        {
          provide: getRepositoryToken(Painting),
          useValue: new MockRepository<Painting>(),
        },
      ],
    }).compile();

    service = module.get<PaintingService>(PaintingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
