import { Painting } from '../../painting/entities/painting.entity';
import { Quiz } from '../entities/quiz.entity';
import { QuizCategory } from '../type';

export class QuizDTO implements Pick<Quiz, 'distractorPaintings' | 'answerPaintings' | 'category'> {
  distractorPaintings: Painting[];
  answerPaintings: Painting[];
  category: QuizCategory;

  similarity: string[];

  constructor(
    distractor: Painting[],
    answer: Painting[],
    category: QuizCategory,
    similarity: string[],
  ) {
    this.distractorPaintings = distractor;
    this.answerPaintings = answer;
    this.category = category;
    this.similarity = similarity;
  }
}
