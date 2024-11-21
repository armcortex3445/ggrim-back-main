import { Module } from '@nestjs/common';
import { PaintingService } from './painting.service';
import { PaintingController } from './painting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Painting } from './entities/painting.entity';
import { WikiArtPainting } from './entities/wikiArt-painting.entity';
import { WikiArtPaintingService } from './sub-service/wikiArt.painting.service';

@Module({
  imports: [TypeOrmModule.forFeature([Painting, WikiArtPainting])],
  controllers: [PaintingController],
  providers: [PaintingService, WikiArtPaintingService],
  exports: [PaintingService, WikiArtPaintingService],
})
export class PaintingModule {}
