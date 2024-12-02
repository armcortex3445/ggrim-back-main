import { Painting } from '../../painting/entities/painting.entity';

export type QuizCategory = keyof Pick<Painting, 'tags' | 'completition_year' | 'artist' | 'styles'>;

export const QuizCategoryValues = ['tags', 'completition_year', 'artist', 'styles'] as const;
