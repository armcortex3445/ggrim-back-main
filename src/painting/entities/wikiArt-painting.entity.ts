import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { wikiArtArtist } from 'src/artist/entities/wikiArt-artist.entity';
import { IsArray, IsNumber, IsString } from 'class-validator';
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
  @IsString()
  width: string;

  @Column()
  @IsString()
  height: string;

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
  @IsString()
  @IsArray()
  genres: string[]; // array of genres names, default: [""]

  @Column({ type: 'varchar', array: true, default: [''] })
  @IsString()
  @IsArray()
  styles: string[]; // array of styles names, default: [""]

  @Column({ type: 'varchar', array: true, default: [''] })
  @IsString()
  @IsArray()
  media: string[]; // array of media names, default: [""]

  @Column({ type: 'varchar', array: true, default: [''] })
  @IsString()
  @IsArray()
  galleries: string[]; // array of galleries names, default: [""]

  @Column({ type: 'varchar', array: true, default: [''] })
  @IsString()
  @IsArray()
  tags: string[]; // array of tags names, default: [""]

  @Column({ nullable: true })
  @IsNumber()
  sizeX: number | null; // original painting dimension X, default: null

  @Column({ nullable: true })
  @IsNumber()
  sizeY: number | null; // original painting dimension Y, default: null

  @Column({ nullable: true })
  @IsNumber()
  diameter: number | null; // original painting diameter, default: null

  @Column({ type: 'text', default: '' })
  description: string; // painting description, default: ""
}
