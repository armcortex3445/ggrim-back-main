import { Crud, CrudController } from '@dataui/crud';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateQuizDTO } from './dto/create-quiz.dto';
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

  /*TODO
  - category 값을 검증하는 pipe 구현하기
  */

  // @Get(':category')
  // async getNewQuizRandomly(@Param('category', validateCategory) category: string) {
  //   const categoryValue = this.service.getRandomCategoryValue(category);
  //   return this.service.createQuizDTO(category, categoryValue);
  // }

  /*TODO
  - ? restFul APi 기반으로 구현하기 
  */
  // @Get('tags/:keyword')
  // async getNewQuizByTag(@Param('keyword') keyword: string) {
  //   return this.service.createQuizDTO('tags', keyword);
  // }

  @Get('artist/:keyword')
  async generateQuiz(@Param('keyword') keyword: string) {
    return this.service.generateQuizByValue('artist', keyword);
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
