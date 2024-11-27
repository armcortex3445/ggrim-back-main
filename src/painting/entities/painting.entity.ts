import { IsString } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomBaseEntity } from '../../db/entity/custom.base.entity';
import { WikiArtPainting } from './wikiArt-painting.entity';

@Entity()
export class Painting extends CustomBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  id!: string;

  @Column()
  @IsString()
  title!: string;

  @OneToOne(() => WikiArtPainting, {
    cascade: ['update', 'insert'],
    eager: true,
  })
  @JoinColumn()
  wikiArtPainting!: WikiArtPainting;
}
