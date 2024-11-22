import { Module } from '@nestjs/common';
import { PaintingModule } from '../painting/painting.module';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [PaintingModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
