import { Crud, CrudController } from '@dataui/crud';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ServiceException } from '../_common/filter/exception/service/service-exception';
import { IPaginationResult } from '../_common/interface';
import { CATEGORY_VALUES } from './const';
import { SearchQuizDTO } from './dto/SearchQuiz.dto';
import { CreateQuizDTO } from './dto/create-quiz.dto';
import { GenerateQuizQueryDTO } from './dto/generate-quiz.query.dto';
import { UpdateQuizDTO } from './dto/update-quiz.dto';
import { Quiz } from './entities/quiz.entity';
import { QuizService } from './quiz.service';
import { QuizCategory } from './type';

@Crud({
  model: {
    type: Quiz,
  },
  routes: {
    only: ['getOneBase'],
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  query: {
    join: {
      distractor_paintings: {
        eager: true,
      },
      answer_paintings: {
        eager: true,
      },
      example_paintings: {
        eager: true,
      },
      styles: {
        eager: true,
      },
      artists: {
        eager: true,
      },
      tags: {
        eager: true,
      },
    },
  },
})
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('quiz')
export class QuizController implements CrudController<Quiz> {
  constructor(public service: QuizService) {}

  @Get('category/:key')
  async getQuizTags(@Param('key') key: string) {
    if (!CATEGORY_VALUES.includes(key as QuizCategory)) {
      throw new ServiceException(
        'BASE',
        'BAD_REQUEST',
        `${key} is not allowed.
      allowed category : ${JSON.stringify(CATEGORY_VALUES)}`,
      );
    }
    const map = await this.service.getCategoryValueMap(key as QuizCategory);
    return [...map.values()];
  }

  @Get('random')
  async generateNew(@Query() dto: GenerateQuizQueryDTO) {
    return this.service.generateQuizByValue(dto.category, dto.keyword);
  }

  @Post()
  async create(@Body() dto: CreateQuizDTO) {
    return this.service.createQuiz(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateQuizDTO) {
    return this.service.updateQuiz(id, dto);
  }

  @Get('search')
  async searchQuiz(
    @Query() dto: SearchQuizDTO,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
  ) {
    const paginationCount = 20;
    const data: Quiz[] = await this.service.searchQuiz(dto, page, paginationCount);

    const ret: IPaginationResult<Quiz> = {
      data,
      isMore: data.length === paginationCount,
      count: data.length,
      pagination: page,
    };

    return ret;
  }
}
