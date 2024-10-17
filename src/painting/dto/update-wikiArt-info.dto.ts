import { PartialType } from '@nestjs/mapped-types';
import { WikiArtPainting } from '../entities/wikiArt-painting.entity';
import { IsString } from 'class-validator';

export class UpdateWikiArtInfoDTO extends PartialType(WikiArtPainting) {
  wikiArtId: string;
}
