import { WikiArtPainting } from '../../painting/entities/wikiArt-painting.entity';

export type QuizCategory = keyof Pick<
  WikiArtPainting,
  'tags' | 'genres' | 'completitionYear' | 'artistName' | 'styles'
>;

export const QuizCategoryValues = [
  'tags',
  'genres',
  'completitionYear',
  'artistName',
  'styles',
] as const;
