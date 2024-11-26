import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateQuizDTO } from './dto/create-quiz.dto';
import { UpdateQuizDTO } from './dto/update-quiz.dto';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  create(@Body() createQuizDto: CreateQuizDTO) {
    return this.quizService.create(createQuizDto);
  }

  @Get()
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(+id);
  }

  @Get('category/tags')
  async getQuizTags() {
    const result = await this.quizService.getCategoryValues('tags');
    return result;
  }

  @Get('category/artist')
  async getQuizArtist() {
    const result = await this.quizService.getCategoryValues('artistName');
    return result;
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
  - restFul APi 기반으로 구현하기 
  */
  @Get('tags/:keyword')
  async getNewQuizByTag(@Param('keyword') keyword: string) {
    return this.quizService.createQuizDTO('tags', keyword);
  }

  @Get('artist/:keyword')
  async getNewQuizByArtistName(@Param('keyword') keyword: string) {
    return this.quizService.createQuizDTO('artistName', keyword);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDTO) {
    return this.quizService.update(+id, updateQuizDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizService.remove(+id);
  }
}
