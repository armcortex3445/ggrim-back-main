import { Module } from '@nestjs/common';
import { PaintingService } from './painting.service';
import { PaintingController } from './painting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Painting } from './entities/painting.entity';
import { WikiArtPainting } from './entities/wikiArt-painting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Painting, WikiArtPainting])],
  controllers: [PaintingController],
  providers: [PaintingService],
  exports: [PaintingService],
})
export class PaintingModule {}
