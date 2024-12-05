import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaintingModule } from '../painting/painting.module';
import { Quiz } from './entities/quiz.entity';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz]), PaintingModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
