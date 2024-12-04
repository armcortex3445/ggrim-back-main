import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CustomBaseEntity } from '../../db/entity/custom.base.entity';
import { Painting } from '../../painting/entities/painting.entity';
import { QUIZ_TIME_LIMIT } from '../const';
import { QUIZ_TYPE, QuizCategory } from '../type';

@Entity()
export class Quiz extends CustomBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  id!: string;

  @Column()
  @IsString()
  title!: string;

  @Column()
  @IsString()
  category!: QuizCategory;

  @ManyToMany(() => Painting, {
    cascade: ['update', 'insert'],
    eager: true,
  })
  @JoinTable()
  distractor_paintings!: Painting[];

  @ManyToMany(() => Painting, {
    cascade: ['update', 'insert'],
    eager: true,
  })
  @JoinTable()
  answer_paintings!: Painting[];

  @Column({
    default: 0,
  })
  @IsNumber()
  correct_count!: number;

  @Column({
    default: 0,
  })
  @IsNumber()
  incorrect_count!: number;

  @Column({
    default: QUIZ_TIME_LIMIT.EASY,
  })
  time_limit!: number;

  @Column()
  type!: QUIZ_TYPE;
}
