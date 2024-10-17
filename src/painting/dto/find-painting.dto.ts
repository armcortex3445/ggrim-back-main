import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { Painting } from '../entities/painting.entity';
import { isTryStatement } from 'typescript';

export class FindPaintingDTO {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  wikiArtID: string;
}
