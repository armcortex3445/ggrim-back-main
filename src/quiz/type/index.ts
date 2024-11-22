import { WikiArtPainting } from '../../painting/entities/wikiArt-painting.entity';

export type QuizCategory = keyof Pick<
  WikiArtPainting,
  'tags' | 'genres' | 'completitionYear' | 'artistName' | 'styles'
>;
