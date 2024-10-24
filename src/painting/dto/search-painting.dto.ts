import { Optional } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

export class SearchPaintingDTO {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  artistName: string;
}
