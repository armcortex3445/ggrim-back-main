import { IsNumber, IsString } from 'class-validator';
import { Column, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Painting } from '../../painting/entities/painting.entity';
import { QuizCategory } from '../type';

export const QUIZ_CONSTANT = {
  DISTRACTOR_COUNT: 3,
  ANSWER_COUNT: 1,
};

export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  id: string = '';

  @Column()
  @IsString()
  title: string = '';

  @Column()
  @IsString()
  category: QuizCategory = 'artist';

  @ManyToMany(() => Painting, {
    cascade: ['update', 'insert'],
    eager: true,
  })
  @JoinTable()
  distractorPaintings: Painting[] = [];

  @ManyToMany(() => Painting, {
    cascade: ['update', 'insert'],
    eager: true,
  })
  @JoinTable()
  answerPaintings: Painting[] = [];

  @Column()
  @IsNumber()
  correctCount: number = -1;

  @Column()
  @IsNumber()
  incorrectCount: number = -1;
}
