import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { IsArray, IsNumber, IsString, ValidateIf } from 'class-validator';
import { Painting } from './painting.entity';
@Entity()
export class WikiArtPainting {
  @PrimaryColumn()
  @IsString()
  wikiArtId: string;

  @Column()
  @IsString()
  title: string;

  @Column()
  @IsString()
  url: string;

  @Column()
  @IsString()
  artistName: string;

  @Column()
  @IsString()
  artistUrl: string;

  //   @ManyToOne(() => wikiArtArtist, (artist) => artist.works)
  //   artist: wikiArtArtist;

  @Column()
  @IsString()
  image: string;

  @Column()
  @IsNumber()
  width: number;

  @Column()
  @IsNumber()
  height: number;

  @Column({ nullable: true })
  @IsNumber()
  completitionYear: number | null; // painting completition year, default: null

  //dictionaries: string[]; // dictionaries ids, default: [""]
  @Column()
  @IsString()
  location: string; // location (country + city), default: ""
  //period: ArtistDictionaryJson | null; // artist’s period of work, default: null
  //serie: ArtistDictionaryJson | null; // artist’s paintings series, default: null

  @Column({ type: 'varchar', array: true, default: [''] })
  @IsArray()
  @IsString({ each: true })
  genres: string[]; // array of genres names, default: [""]

  @Column({ type: 'varchar', array: true, default: [''] })
  @IsArray()
  @IsString({ each: true })
  styles: string[]; // array of styles names, default: [""]

  @Column({ type: 'varchar', array: true, default: [''] })
  @IsArray()
  @IsString({ each: true })
  media: string[]; // array of media names, default: [""]

  @Column({ type: 'varchar', array: true, default: [''] })
  @IsArray()
  @IsString({ each: true })
  galleries: string[]; // array of galleries names, default: [""]

  @Column({ type: 'varchar', array: true, default: [''] })
  @IsArray()
  @IsString({ each: true })
  tags: string[]; // array of tags names, default: [""]

  @Column('decimal', { precision: 12, scale: 5, nullable: true })
  @ValidateIf((object, value) => value !== null)
  @IsNumber({ allowNaN: false }, { message: 'sizeX is not number' })
  sizeX: number | null; // original painting dimension X, default: null

  @Column('decimal', { precision: 12, scale: 5, nullable: true })
  @ValidateIf((object, value) => value !== null)
  @IsNumber({ allowNaN: false }, { message: 'sizeY is not number' })
  sizeY: number | null; // original painting dimension Y, default: null

  @Column('decimal', { precision: 12, scale: 5, nullable: true })
  @ValidateIf((object, value) => value !== null)
  @IsNumber({ allowNaN: false }, { message: 'diameter is not number' })
  diameter: number | null; // original painting diameter, default: null

  @Column({ type: 'text', default: '' })
  @IsString()
  description: string; // painting description, default: ""

  @OneToOne(() => Painting, {
    cascade: ['update', 'insert'],
    eager: true,
  })
  painting: Painting;
}
