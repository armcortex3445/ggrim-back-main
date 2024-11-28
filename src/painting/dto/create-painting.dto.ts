import { PickType } from '@nestjs/mapped-types';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Painting } from '../entities/painting.entity';

//export class CreatePaintingDTO extends PartialType(Painting) {}
export class CreatePaintingDTO extends PickType(Painting, ['title', 'image_url', 'description']) {
  @IsOptional()
  @IsString()
  artistName?: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  completition_year?: number;

  /*TODO
  -  DB에 저장된 tag와 Style 값만 통과하도록 수정하기.
    - 방법 1 : @IsInArray() 데코레이터를 활용  
  */
  @IsOptional()
  @IsArray()
  @IsString({
    each: true,
  })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({
    each: true,
  })
  styles?: string[];
}
