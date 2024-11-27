import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Painting } from './entities/painting.entity';
import { Style } from './entities/style.entity';
import { Tag } from './entities/tag.entity';
import { WikiArtPainting } from './entities/wikiArt-painting.entity';
import { PaintingController } from './painting.controller';
import { PaintingService } from './painting.service';
import { WikiArtPaintingService } from './sub-service/wikiArt.painting.service';

@Module({
  imports: [TypeOrmModule.forFeature([Painting, WikiArtPainting, Tag, Style])],
  controllers: [PaintingController],
  providers: [PaintingService, WikiArtPaintingService],
  exports: [PaintingService, WikiArtPaintingService],
})
export class PaintingModule {}
