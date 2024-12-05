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
import { QuizService } from './quiz.service';
import { QuizCategory } from './type';

@UsePipes(ValidationPipe)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('category/:key')
  async getQuizTags(@Param('key') key: string) {
    const map = await this.quizService.getCategoryValueMap(key as QuizCategory);
    return [...map.values()];
  }

  /*TODO
  - category 값을 검증하는 pipe 구현하기
  */

  // @Get(':category')
  // async getNewQuizRandomly(@Param('category', validateCategory) category: string) {
  //   const categoryValue = this.quizService.getRandomCategoryValue(category);
  //   return this.quizService.createQuizDTO(category, categoryValue);
  // }

  /*TODO
  - ? restFul APi 기반으로 구현하기 
  */
  // @Get('tags/:keyword')
  // async getNewQuizByTag(@Param('keyword') keyword: string) {
  //   return this.quizService.createQuizDTO('tags', keyword);
  // }

  @Get('artist/:keyword')
  async generateQuiz(@Param('keyword') keyword: string) {
    return this.quizService.generateQuizByValue('artist', keyword);
  }

  @Post()
  async createQuiz(@Body() dto: CreateQuizDTO) {
    return this.quizService.createQuiz(dto);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDTO) {
  //   return this.quizService.update(+id, updateQuizDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.quizService.remove(+id);
  // }
}
