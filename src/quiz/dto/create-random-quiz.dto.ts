import { IsInArray } from '../../utils/class-validator';
import { QuizCategory, QuizCategoryValues } from '../type';

export class CreateRandomQuizDTO {
  @IsInArray([...QuizCategoryValues])
  category!: QuizCategory;
}
