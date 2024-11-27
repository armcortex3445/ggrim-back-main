import { IsString } from 'class-validator';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { CustomBaseEntity } from '../../db/entity/custom.base.entity';
import { Painting } from './painting.entity';

@Entity()
@Unique(['name'])
export class Tag extends CustomBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  id!: string;

  @Column({ nullable: true }) // need to distinct value
  @IsString()
  name!: string;

  @Column({ nullable: true })
  @IsString()
  info_url!: string;

  @ManyToMany(() => Painting, (painting) => painting.tags)
  paintings!: Painting[];
}
