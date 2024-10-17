import { PartialType, PickType } from '@nestjs/mapped-types';
import { Painting } from '../entities/painting.entity';
import { IsString } from 'class-validator';

//export class CreatePaintingDto extends PartialType(Painting) {}
export class CreatePaintingDto extends PickType(Painting, ['title']) {
  @IsString()
  title: string;
}
