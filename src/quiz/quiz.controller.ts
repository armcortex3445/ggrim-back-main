import { Crud, CrudController } from '@dataui/crud';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ServiceException } from '../_common/filter/exception/service/service-exception';
import { CATEGORY_VALUES } from './const';
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
    },
  },
})
@UsePipes(ValidationPipe)
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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDTO) {
  //   return this.service.update(+id, updateQuizDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.service.remove(+id);
  // }
}
