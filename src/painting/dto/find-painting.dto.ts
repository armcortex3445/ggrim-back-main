import { IsOptional, IsString } from 'class-validator';
import { TYPE_DEFAULT_VALUE } from '../../_common/const/default.value';

export class FindPaintingDTO {
  @IsString()
  wikiArtID: string = TYPE_DEFAULT_VALUE.string;

  @IsOptional()
  @IsString()
  id: string = TYPE_DEFAULT_VALUE.string;
}
