import { IsInArray } from '../../utils/class-validator';
import { QuizCategoryValues } from '../const';
import { QuizCategory } from '../type';

export class CreateRandomQuizDTO {
  @IsInArray([...QuizCategoryValues])
  category!: QuizCategory;
}
