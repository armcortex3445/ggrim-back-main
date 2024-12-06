import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistModule } from '../artist/artist.module';
import { TagModule } from './child-module/tag/tag.modue';
import { Painting } from './entities/painting.entity';
import { Style } from './entities/style.entity';
import { WikiArtPainting } from './entities/wikiArt-painting.entity';
import { PaintingController } from './painting.controller';
import { PaintingService } from './painting.service';
import { StyleService } from './sub-service/style.service';
import { WikiArtPaintingService } from './sub-service/wikiArt.painting.service';

@Module({
  imports: [TypeOrmModule.forFeature([Painting, WikiArtPainting, Style]), ArtistModule, TagModule],
  controllers: [PaintingController],
  providers: [PaintingService, WikiArtPaintingService, StyleService],
  exports: [PaintingService, WikiArtPaintingService],
})
export class PaintingModule {}
