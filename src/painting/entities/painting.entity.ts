import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { WikiArtPainting } from './wikiArt-painting.entity';
import { IsNumber, IsString } from 'class-validator';

@Entity()
export class Painting {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  id: string;

  @Column()
  @IsString()
  title: string;

  @OneToOne(() => WikiArtPainting, {
    cascade: ['update'],
    eager: true,
  })
  @JoinColumn()
  wikiArtPainting: WikiArtPainting;
}
