import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceException } from '../_common/filter/exception/service/service-exception';
import { Artist } from '../artist/entities/artist.entity';
import { Painting } from '../painting/entities/painting.entity';
import { PaintingService } from '../painting/painting.service';
import { extractValuesFromArray, updateProperty } from '../utils/object';
import { getRandomElement, getRandomNumber } from '../utils/random';
import { isNotFalsy } from '../utils/validator';
import { QUIZ_TYPE_CONFIG } from './const';
import { CreateQuizDTO } from './dto/create-quiz.dto';
import { QuizDTO } from './dto/quiz.dto';
import { UpdateQuizDTO } from './dto/update-quiz.dto';
import { Quiz } from './entities/quiz.entity';
import { QUIZ_TYPE, QuizCategory } from './type';

@Injectable()
export class QuizService extends TypeOrmCrudService<Quiz> {
  constructor(
    @InjectRepository(Quiz) repo: Repository<Quiz>,
    @Inject(PaintingService) private readonly paintingService: PaintingService,
  ) {
    super(repo);
  }

  async getCategoryValueMap(category: QuizCategory): Promise<Map<string, any>> {
    return await this.paintingService.getColumnValueMap(category);
  }

  async getRandomCategoryValue(category: QuizCategory): Promise<any> {
    const map: Map<string, any> = await this.getCategoryValueMap(category);
    const keys = [...map.keys()];
    const selectedKey = getRandomElement(keys);

    if (!selectedKey) {
      throw new ServiceException(
        'ENTITY_NOT_FOUND',
        'INTERNAL_SERVER_ERROR',
        `category : ${category}\n` + `maps : ${JSON.stringify(map)}`,
      );
    }

    return map.get(selectedKey);
  }

  extractCategoryValues(paintings: Painting[], category: QuizCategory): any[] {
    const values = extractValuesFromArray(paintings, category);
    const set = new Set<any>();

    if (category == 'artist') {
      const artists = values as Artist[];
      artists.forEach((artist) => set.add(artist.name));

      return [...set];
    }

    return [...set];
  }

  async generateQuizByValue(category: QuizCategory, selectedCategoryValue: any): Promise<QuizDTO> {
    await this.paintingService.validateColumnValue(category, selectedCategoryValue);
    const categoryMap = await this.getCategoryValueMap(category);

    const commonCategoryValue = selectedCategoryValue;

    const distractorPaintings = await this.selectDistractorPaintings(
      category,
      commonCategoryValue,
      QUIZ_TYPE_CONFIG.ONE_CHOICE.COUNT.DISTRACTOR,
    );

    const answerCategoryValues = this.getAnswerCategoryValues(
      category,
      distractorPaintings,
      categoryMap,
    );

    const answerPaintings = await this.getAnswerPaintings(
      category,
      answerCategoryValues,
      getRandomNumber(0, answerCategoryValues.length - 1),
    );

    const answerIdx = getRandomNumber(0, answerPaintings.length - 1);
    const answer = answerPaintings[answerIdx];
    const distractor = [...distractorPaintings];

    const ret = new QuizDTO(distractor, [answer], category, commonCategoryValue);
    this.validateQuizDto(ret, category, QUIZ_TYPE_CONFIG.ONE_CHOICE.COUNT.DISTRACTOR);

    return ret;
  }

  async selectDistractorPaintings(
    category: QuizCategory,
    commonValue: any,
    count: number,
  ): Promise<Painting[]> {
    let paintings: Painting[] = [];

    if ((category = 'artist')) {
      /*TODO
      - 동명이인 작가는 어떻게 처리할 것인가? */
      paintings = await this.paintingService.getPaintingsByArtist(commonValue);
    }

    const map = new Map<number, Painting>();
    if (paintings.length > count) {
      while (map.size != count) {
        const idx = getRandomNumber(0, paintings.length - 1);
        if (map.has(idx)) {
          continue;
        }
        map.set(idx, paintings[idx]);
      }
      return [...map.values()];
    }

    if (paintings.length < count) {
      throw new ServiceException(
        'ENTITY_NOT_FOUND',
        'BAD_REQUEST',
        `Not enough Paintings.\n` +
          `${JSON.stringify({ category, commonValue, count, paintings }, null, 2)}`,
      );
    }

    return paintings;
  }

  async getAnswerPaintings(
    category: QuizCategory,
    answerCategoryValues: any[],
    valueIdx: number,
  ): Promise<Painting[]> {
    let answerPaintings: Painting[] = [];

    if (!(valueIdx > 0 && answerCategoryValues.length - 1 > valueIdx)) {
      throw new ServiceException(
        'SERVICE_RUN_ERROR',
        'INTERNAL_SERVER_ERROR',
        `valueIdx is out of range.\n` +
          `${JSON.stringify({ category, length: answerCategoryValues.length - 1, valueIdx })}`,
      );
    }

    const categoryValue = answerCategoryValues[valueIdx];

    if (category === 'artist') {
      const artist = categoryValue;
      answerPaintings = await this.paintingService.getPaintingsByArtist(artist);
    }

    return answerPaintings;
  }

  getAnswerCategoryValues(
    category: QuizCategory,
    distractorPaintings: Painting[],
    categoryMap: Map<string, any>,
  ): any[] {
    const distractorCategoryValues = this.extractCategoryValues(distractorPaintings, category);
    const answerCategoryValues: any[] = [];
    categoryMap.forEach((value, key) => {
      if (!distractorCategoryValues.includes(value)) {
        answerCategoryValues.push(value);
      }
    });

    return answerCategoryValues;
  }

  validateQuizDto(quizDTO: QuizDTO, category: QuizCategory, distractorCount: number) {
    const distractor = quizDTO.distractorPaintings;
    const answer = quizDTO.answerPaintings;

    if (distractor.length != distractorCount) {
      throw new ServiceException(
        'SERVICE_RUN_ERROR',
        'INTERNAL_SERVER_ERROR',
        `distractor : ${distractor.length}`,
      );
    }

    if (answer.length != QUIZ_TYPE_CONFIG.ONE_CHOICE.COUNT.ANSWER) {
      throw new ServiceException(
        'SERVICE_RUN_ERROR',
        'INTERNAL_SERVER_ERROR',
        `answer : ${answer.length}`,
      );
    }

    const distractorFields = this.extractCategoryValues(distractor, category);

    const answerFields = this.extractCategoryValues(answer, category);

    const isNoCommonValues = answerFields.every(
      (answerField) => !distractorFields.includes(answerField),
    );

    if (!isNoCommonValues) {
      throw new ServiceException(
        'SERVICE_RUN_ERROR',
        'INTERNAL_SERVER_ERROR',
        `answer has fields of distractor\n` +
          `distractorFields : ${JSON.stringify(distractorFields, null, 2)}\n` +
          `answerFields : ${JSON.stringify(answerFields, null, 2)}\n` +
          `category : ${category}`,
      );
    }
  }

  async createQuiz(dto: CreateQuizDTO) {
    const ids: string[] = [...dto.answerPaintingIds, ...dto.distractorPaintingIds];
    const paintings: Painting[] = await this.paintingService.getByIds(ids);

    const answerPaintings: Painting[] = paintings.filter((p) =>
      dto.answerPaintingIds.includes(p.id),
    );
    const distractorPaintings: Painting[] = paintings.filter((p) =>
      dto.distractorPaintingIds.includes(p.id),
    );

    return this.insertQuiz(
      answerPaintings,
      distractorPaintings,
      dto.category,
      dto.type,
      dto.time_limit,
      dto.title,
    );
  }

  private async insertQuiz(
    answerPaintings: Painting[],
    distractorPaintings: Painting[],
    category: QuizCategory,
    type: QUIZ_TYPE,
    timeLimit: number,
    title: string,
  ) {
    const newQuiz = new Quiz();
    /*TODO 
      - Quiz.type 에 알맞은 그림 개수 검증필요
    */
    newQuiz.answer_paintings = [...answerPaintings];
    newQuiz.distractor_paintings = [...distractorPaintings];
    newQuiz.category = category;
    newQuiz.type = type;
    newQuiz.time_limit = timeLimit;
    newQuiz.title = title;

    return await this.repo.save(newQuiz);
  }

  async updateQuiz(id: string, dto: UpdateQuizDTO) {
    const quiz = await this.repo.findOneByOrFail({ id });
    if (!isNotFalsy(quiz)) {
      throw new ServiceException(
        'ENTITY_NOT_FOUND',
        'BAD_REQUEST',
        `Not found quiz.\n` + `id : ${id}`,
      );
    }

    updateProperty(quiz, 'category', dto.category);
    updateProperty(quiz, 'time_limit', dto.time_limit);
    updateProperty(quiz, 'title', dto.title);

    if (dto.answerPaintingIds) {
      quiz.answer_paintings = await this.paintingService.getByIds(dto.answerPaintingIds);
    }

    if (dto.distractorPaintingIds) {
      quiz.distractor_paintings = await this.paintingService.getByIds(dto.distractorPaintingIds);
    }

    return this.repo.save(quiz);
  }
}
