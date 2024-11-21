import { PickType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { TYPE_DEFAULT_VALUE } from '../../_common/const/default.value';
import { Painting } from '../entities/painting.entity';

//export class CreatePaintingDto extends PartialType(Painting) {}
export class CreatePaintingDto extends PickType(Painting, ['title']) {
  @IsString()
  title: string = TYPE_DEFAULT_VALUE.string;
}
