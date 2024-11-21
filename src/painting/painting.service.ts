import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceException } from '../_common/filter/exception/service/service-exception';
import { CreatePaintingDto } from './dto/create-painting.dto';
import { SearchPaintingDTO } from './dto/search-painting.dto';
import { UpdatePaintingDto } from './dto/update-painting.dto';
import { UpdateWikiArtInfoDTO } from './dto/update-wikiArt-info.dto';
import { Painting } from './entities/painting.entity';
import { WikiArtPainting } from './entities/wikiArt-painting.entity';

export interface IPaginationResult<T> {
  data: T[];
  count: number;
  pagination: number;
  isMore?: boolean;
}
export interface IResult<T> {
  data: T | null | undefined;
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

  async findPainting(wikiArtID: string): Promise<IResult<Painting>> {
    const data = await this.paintingRepository
      .createQueryBuilder('painting')
      .leftJoinAndSelect('painting.wikiArtPainting', 'wikiArtPainting')
      .where('wikiArtPainting.wikiArtId = :wikiArtID', { wikiArtID })
      .getOne();

    const ret: IResult<Painting> = { data: data || new Painting() };

    return ret;
  }

  async searchPainting(dto: SearchPaintingDTO, page: number) {
    const maxCnt = 50;

    const tags = JSON.parse(dto.tags) as string[];

    const result = await this.paintingRepository
      .createQueryBuilder('painting')
      .leftJoinAndSelect('painting.wikiArtPainting', 'wikiArtPainting')
      .where("painting.title like '%' || :title || '%'", { title: dto.title })
      .andWhere("wikiArtPainting.artistName like '%' || :artist || '%'", {
        artist: dto.artistName || '',
      })
      .andWhere('wikiArtPainting.tags @> :tags', { tags })
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

  async searchPaintingWithoutAndWithValue(
    key: keyof WikiArtPainting,
    excludedValues: string[],
    includedValues: string[],
  ) {
    const maxCnt = 50;

    const result = await this.paintingRepository
      .createQueryBuilder('painting')
      .leftJoinAndSelect('painting.wikiArtPainting', 'wikiArtPainting')
      .where(`NOT (wikiArtPainting.${key} @> :excludedValues)`, { excludedValues })
      .andWhere(`wikiArtPainting.${key} @> :includedValues`, {
        includedValues,
      })
      .getMany();

    return result;
  }

  //wikiArt functions
  async getwikiArtInfo(id: string) {
    const entity = await this.findOneById(id);

    if (entity == null) {
      return null;
    }

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

    if (updatedEntity == undefined) {
      throw new ServiceException(
        'ENTITY_NOT_FOUND',
        'BAD_REQUEST',
        `id : ${id} ,\n dto  : ${JSON.stringify(dto, null, 2)}`,
      );
    }

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
