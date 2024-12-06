import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistModule } from '../artist/artist.module';
import { Style } from './child-module/style/entities/style.entity';
import { StyleModule } from './child-module/style/style.module';
import { StyleService } from './child-module/style/style.service';
import { TagModule } from './child-module/tag/tag.modue';
import { Painting } from './entities/painting.entity';
import { WikiArtPainting } from './entities/wikiArt-painting.entity';
import { PaintingController } from './painting.controller';
import { PaintingService } from './painting.service';
import { WikiArtPaintingService } from './sub-service/wikiArt.painting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Painting, WikiArtPainting, Style]),
    ArtistModule,
    TagModule,
    StyleModule,
  ],
  controllers: [PaintingController],
  providers: [PaintingService, WikiArtPaintingService, StyleService],
  exports: [PaintingService, WikiArtPaintingService],
})
export class PaintingModule {}
