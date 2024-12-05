import { ArrayNotEmpty, IsArray, IsNumber, IsString, IsUUID } from 'class-validator';
import { IsInArray } from '../../utils/class-validator';
import { CATEGORY_VALUES, TYPE_VALUES } from '../const';
import { QUIZ_TYPE, QuizCategory } from '../type';

export class CreateQuizDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, {
    each: true,
  })
  answerPaintingIds!: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, {
    each: true,
  })
  distractorPaintingIds!: string[];

  @IsString()
  title!: string;

  @IsNumber()
  time_limit!: number;

  @IsString()
  @IsInArray(CATEGORY_VALUES)
  category!: QuizCategory;

  @IsString()
  @IsInArray(TYPE_VALUES)
  type!: QUIZ_TYPE;
}
