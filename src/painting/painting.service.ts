import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreatePaintingDto } from './dto/create-painting.dto';
import { UpdatePaintingDto } from './dto/update-painting.dto';
import { Painting } from './entities/painting.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { FindPaintingDTO } from './dto/find-painting.dto';
import { isArray } from 'class-validator';
import { UpdateWikiArtInfoDTO } from './dto/update-wikiArt-info.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { WikiArtPainting } from './entities/wikiArt-painting.entity';
import { Artist } from 'src/artist/entities/artist.entity';
import { wikiArtArtist } from 'src/artist/entities/wikiArt-artist.entity';

export interface IResult<T> {
  data: T | T[];
  pagination?: number;
  isMore?: boolean;
}

export interface UpdateInfo {
  targetId: string;
  isSuccess: boolean;
}

@Injectable()
export class PaintingService extends TypeOrmCrudService<Painting> {
  constructor(
    @InjectRepository(Painting) repo,
    @InjectRepository(WikiArtPainting)
    private readonly wikiArtPaintingRepo: Repository<WikiArtPainting>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    super(repo);
  }
  async create(createPaintingDto: CreatePaintingDto) {
    const result = await this.repo
      .createQueryBuilder()
      .insert()
      .into(Painting)
      .values([{ title: createPaintingDto.title }])
      .execute();

    const ret = { id: result.identifiers[0].id };

    return ret;
  }

  findAll() {
    return `This action returns all painting`;
  }

  update(id: number, updatePaintingDto: UpdatePaintingDto) {
    return `This action updates a #${id} painting`;
  }

  remove(id: number) {
    return `This action removes a #${id} painting`;
  }

  async findPaintingByTitle(title: string, wikiArtID: string, page: number = 0) {
    let data: Painting[] | Painting = null;
    let isMore = false;
    let pagination = page;
    const maxFindRows = 60;
    const maxRows = 40;

    const ret: IResult<Painting> = { data: null };

    if (wikiArtID) {
      data = await this.repo
        .createQueryBuilder('painting')
        .innerJoinAndSelect(
          'painting.wikiArtPainting',
          'wikiArtPainting',
          'wikiArtPainting.id = : wikiArtID',
          { wikiArtID },
        )
        .where('painting.title = :title ', { title })
        .getMany();

      if (isArray(data)) throw new Error('DB has inconsistency. need to handle it');
      ret.data = null;
    } else {
      data = await this.repo
        .createQueryBuilder('painting')
        .select()
        .where('painting.title = :title ', { title })
        .skip(page)
        .take(maxFindRows)
        .getMany();

      isMore = maxRows < data.length;
      data = data.slice(0, maxRows);
      ret.data = data;
      ret.isMore = isMore;
      ret.pagination = pagination;
    }

    return ret;
  }

  async updateWikiArt(id: string, dto: UpdateWikiArtInfoDTO) {
    const partialEntity = {
      id,
      wikiArtPainting: {
        ...dto,
      },
    };

    /*TODO
    밑에 로직이랑 해당 로직이란 무슨차이인가?
    */
    const updatedEntity = await this.repo.preload(partialEntity);
    Logger.debug(`${JSON.stringify(partialEntity, null, 2)}`);

    await this.repo.save(updatedEntity);

    // const painting = await this.repo
    //   .createQueryBuilder('painting')
    //   .leftJoinAndSelect('painting.wikiArtPainting', 'wikiArt')
    //   .where('painting.id = :id', { id })
    //   .getOne();

    // if (!this.validatePaintingEntity(painting))
    //   throw new InternalServerErrorException(`[updateWikiArt] can't find Entity with id ${id}.`);

    // if (painting.wikiArtPainting) {
    //   const wikiArt = await this.wikiArtPaintingRepo
    //     .createQueryBuilder('wiki')
    //     .update()
    //     .set(dto)
    //     .where('wiki.wikiArtId = :id ', { id: painting.wikiArtPainting.wikiArtId })
    //     .execute();
    // }

    const ret: IResult<UpdateInfo> = { data: { targetId: id, isSuccess: true } };

    return ret;
  }

  validatePaintingEntity(painting: Painting): boolean {
    if (!painting) return false;

    if (!painting.id) return false;

    return true;
  }
}
