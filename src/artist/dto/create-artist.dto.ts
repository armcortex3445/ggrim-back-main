import { PickType } from '@nestjs/mapped-types';
import { IsDate, IsOptional, IsUrl } from 'class-validator';
import { Artist } from '../entities/artist.entity';

export class CreateArtistDTO extends PickType(Artist, ['name', 'image_url']) {
  @IsOptional()
  @IsDate()
  birth_date!: Date;

  @IsOptional()
  @IsDate()
  death_date!: Date;

  @IsOptional()
  @IsUrl()
  info_url!: string;
}
