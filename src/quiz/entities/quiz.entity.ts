import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Artist } from '../../artist/entities/artist.entity';
import { CustomBaseEntity } from '../../db/entity/custom.base.entity';
import { Style } from '../../painting/child-module/style/entities/style.entity';
import { Tag } from '../../painting/child-module/tag/entities/tag.entity';
import { Painting } from '../../painting/entities/painting.entity';
import { QUIZ_TIME_LIMIT } from '../const';
import { QUIZ_TYPE } from '../type';

@Entity()
export class Quiz extends CustomBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  id!: string;

  @Column()
  @IsString()
  title!: string;

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

  /*TODO
    - 추가된 컬럼을 반영하여 CRUD 로직 수정하기
  */
  @ManyToOne(() => Painting, {
    cascade: ['update', 'insert'],
    eager: true,
  })
  @JoinTable()
  example_painting!: Painting;

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

  @ManyToMany(() => Artist, {
    cascade: ['update', 'insert'],
  })
  @JoinTable()
  artists!: Artist[];

  @ManyToMany(() => Tag, {
    cascade: ['update', 'insert'],
  })
  @JoinTable()
  tags!: Tag[];

  @ManyToMany(() => Style, {
    cascade: ['update', 'insert'],
  })
  @JoinTable()
  styles!: Style[];
}
