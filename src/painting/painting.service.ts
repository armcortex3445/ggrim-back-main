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
import { SearchPaintingDTO } from './dto/search-painting.dto';

export interface IPaginationResult<T> {
  data: T[];
  count: number;
  pagination: number;
  isMore?: boolean;
}
export interface IResult<T> {
  data: T;
}

export interface UpdateInfo {
  targetId: string;
  isSuccess: boolean;
}

@Injectable()
export class PaintingService extends TypeOrmCrudService<Painting> {
  constructor(
    @InjectRepository(Painting) private readonly paintingRepository: Repository<Painting>,
  ) {
    super(paintingRepository);
  }
  async create(createPaintingDto: CreatePaintingDto) {
    const result = await this.paintingRepository
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

  findOneById(id: string) {
    return this.paintingRepository
      .createQueryBuilder('painting')
      .innerJoinAndSelect('painting.wikiArtPainting', 'wikiArtPainting')
      .where('painting.id = :id ', { id })
      .getOne();
  }

  async findPainting(wikiArtID: string) {
    let data: Painting = null;
    const ret: IResult<Painting> = { data: null };

    data = await this.paintingRepository
      .createQueryBuilder('painting')
      .leftJoinAndSelect('painting.wikiArtPainting', 'wikiArtPainting')
      .where('wikiArtPainting.wikiArtId = :wikiArtID', { wikiArtID })
      .getOne();

    ret.data = data;

    return ret;
  }

  async searchPainting(dto: SearchPaintingDTO, page: number) {
    const maxCnt = 50;

    const result = await this.paintingRepository
      .createQueryBuilder('painting')
      .leftJoinAndSelect('painting.wikiArtPainting', 'wikiArtPainting')
      .where("painting.title like '%' || :title || '%'", { title: dto.title })
      .andWhere("wikiArtPainting.artistName like '%' || :artist || '%'", {
        artist: dto.artistName || '',
      })
      .skip(page * maxCnt)
      .take(maxCnt)
      .getMany();

    const ret: IPaginationResult<Painting> = {
      data: result,
      isMore: result.length === maxCnt,
      count: result.length,
      pagination: page,
    };
    return ret;
  }

  //wikiArt functions
  async getwikiArtInfo(id: string) {
    const ret: IResult<WikiArtPainting> = { data: null };

    const entity = await this.findOneById(id);

    return entity.wikiArtPainting;
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
    const updatedEntity = await this.paintingRepository.preload(partialEntity);
    Logger.debug(`[updateWikiArt] partialEntity : ${JSON.stringify(partialEntity, null, 2)}`);

    await this.paintingRepository.save(updatedEntity);

    // const painting = await this.paintingRepository
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
