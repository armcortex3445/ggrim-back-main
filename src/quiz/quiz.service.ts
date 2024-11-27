import { Inject, Injectable } from '@nestjs/common';
import { ServiceException } from '../_common/filter/exception/service/service-exception';
import { Painting } from '../painting/entities/painting.entity';
import { PaintingService } from '../painting/painting.service';
import { WikiArtPaintingService } from '../painting/sub-service/wikiArt.painting.service';
import { extractValuesFromArray } from '../utils/extractor';
import { getRandomElement, getRandomNumber } from '../utils/random';
import { CreateQuizDTO } from './dto/create-quiz.dto';
import { QuizDTO } from './dto/quiz.dto';
import { UpdateQuizDTO } from './dto/update-quiz.dto';
import { QUIZ_CONSTANT } from './entities/quiz.entity';
import { QuizCategory } from './type';

@Injectable()
export class QuizService {
  constructor(
    @Inject(WikiArtPaintingService) private readonly wikiArtPaintingService: WikiArtPaintingService,
    @Inject(PaintingService) private readonly paintingService: PaintingService,
  ) {}

  create(createQuizDto: CreateQuizDTO) {
    return 'This action adds a new quiz';
  }

  findAll() {
    return `This action returns all quiz`;
  }

  findOne(id: number) {
    return `This action returns a #${id} quiz`;
  }

  update(id: number, updateQuizDto: UpdateQuizDTO) {
    return `This action updates a #${id} quiz`;
  }

  remove(id: number) {
    return `This action removes a #${id} quiz`;
  }

  async getCategoryValues(category: QuizCategory): Promise<any[]> {
    const result = await this.wikiArtPaintingService.getColumnValues(category);

    return result;
  }

  async getRandomCategoryValue(category: QuizCategory): Promise<any> {
    const values = await this.getCategoryValues(category);

    return getRandomElement(values);
  }

  async createQuizDTO(category: QuizCategory, categoryValue: any): Promise<QuizDTO> {
    const categoryValues = await this.getCategoryValues(category);

    if (!categoryValues.includes(categoryValue)) {
      throw new ServiceException(
        'SERVICE_RUN_ERROR',
        'INTERNAL_SERVER_ERROR',
        `categoryValue is not exist.\n` +
          `categoryValue : ${categoryValue}\n` +
          `category : ${category}`,
      );
    }

    const commonCategoryValue = categoryValue;

    const distractorPaintings = await this.selectDistractorPaintings(
      category,
      commonCategoryValue,
      QUIZ_CONSTANT.DISTRACTOR_COUNT,
    );
    const distractorCategoryValues = extractValuesFromArray(
      distractorPaintings.map((painting) => painting.wikiArtPainting),
      category,
    );

    const answerCandidateCategoryValues = categoryValues.filter(
      (value) => !distractorCategoryValues.includes(value),
    );
    const answerCategoryValue =
      answerCandidateCategoryValues[getRandomNumber(0, answerCandidateCategoryValues.length - 1)];
    const answerPaintings = await this.selectAnswerPaintings(
      category,
      [answerCategoryValue],
      distractorCategoryValues,
    );

    const answerIdx = getRandomNumber(0, answerPaintings.length - 1);
    const answer = answerPaintings[answerIdx];
    const distractor = [...distractorPaintings];

    const ret = new QuizDTO(distractor, [answer], category, commonCategoryValue);
    this.validateQuizDto(ret, category, QUIZ_CONSTANT.DISTRACTOR_COUNT);

    return ret;
  }

  async selectDistractorPaintings(
    category: QuizCategory,
    commonValue: any,
    count: number,
  ): Promise<Painting[]> {
    const paintings = await this.paintingService.searchPaintingWithoutAndWithValue(
      category,
      [],
      [commonValue],
    );
    const result = [] as Painting[];
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
      return result;
    }

    return paintings;
  }

  async selectAnswerPaintings(
    category: QuizCategory,
    includeCategoryValues: any[],
    excludesCategoryValues: any[],
  ): Promise<Painting[]> {
    const answerPaintings = await this.paintingService.searchPaintingWithoutAndWithValue(
      category,
      excludesCategoryValues,
      includeCategoryValues,
    );

    return answerPaintings;
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

    if (answer.length != QUIZ_CONSTANT.ANSWER_COUNT) {
      throw new ServiceException(
        'SERVICE_RUN_ERROR',
        'INTERNAL_SERVER_ERROR',
        `answer : ${answer.length}`,
      );
    }

    const distractorFields = extractValuesFromArray(
      distractor.map((painting) => painting.wikiArtPainting),
      category,
    );

    const answerFields = extractValuesFromArray(
      answer.map((painting) => painting.wikiArtPainting),
      category,
    );

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
}
