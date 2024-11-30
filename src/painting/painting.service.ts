import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isArray } from 'class-validator';
import { Repository } from 'typeorm';
import { ServiceException } from '../_common/filter/exception/service/service-exception';
import { ArtistService } from '../artist/artist.service';
import { Artist } from '../artist/entities/artist.entity';
import { isArrayEmpty, isNotFalsy } from '../utils/validator';
import { CreatePaintingDTO } from './dto/create-painting.dto';
import { SearchPaintingDTO } from './dto/search-painting.dto';
import { UpdateWikiArtInfoDTO } from './dto/update-wikiArt-info.dto';
import { Painting } from './entities/painting.entity';
import { Style } from './entities/style.entity';
import { Tag } from './entities/tag.entity';
import { WikiArtPainting } from './entities/wikiArt-painting.entity';
import { StyleService } from './sub-service/style.service';
import { TagService } from './sub-service/tag.service';

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
    @InjectRepository(Painting) repo: Repository<Painting>,
    @Inject(TagService) private readonly tagService: TagService,
    @Inject(StyleService) private readonly styleService: StyleService,
    @Inject(ArtistService) private readonly artistService: ArtistService,
  ) {
    super(repo);
  }
  async create(dto: CreatePaintingDTO) {
    /*TODO
    - relation 데이터 삽입을 위한 로직 재사용성 및 성능 높이기
      - 방법 1) 각각의 값이 DB에 존재하는지 검증하는 validator decorator를 구현한다.
        - 쿼리 발생 횟수를 줄이기 위해서, 각각의 값을 앱에 저장하거나 DB cache를 사용한다.
        - decorator는 다른 dto에서도 사용할 수 있게 만든다.
    */
    let tags: Tag[] = [];
    if (isNotFalsy(dto.tags) && !isArrayEmpty(dto.tags)) {
      tags = await this.tagService.findManyByName(dto.tags);
      if (isArrayEmpty(tags)) {
        throw new ServiceException(
          'ENTITY_NOT_FOUND',
          'BAD_REQUEST',
          `not found : ${JSON.stringify(dto.tags)}`,
        );
      }
    }

    let styles: Style[] = [];
    if (isNotFalsy(dto.styles) && !isArrayEmpty(dto.styles)) {
      styles = await this.tagService.findManyByName(dto.styles);
      if (isArrayEmpty(styles)) {
        throw new ServiceException(
          'ENTITY_NOT_FOUND',
          'BAD_REQUEST',
          `not found : ${JSON.stringify(dto.styles)}`,
        );
      }
    }

    let artist: Artist | undefined = undefined;
    if (isNotFalsy(dto.artistName)) {
      const artists = await this.artistService.find({
        where: { name: dto.artistName },
      });

      if (artists.length > 1) {
        throw new ServiceException(
          'DB_INCONSISTENCY',
          'INTERNAL_SERVER_ERROR',
          `${dto.artistName} is multiple.\n
        ${JSON.stringify(artists, null, 2)}`,
        );
      }

      if (isArrayEmpty(artists)) {
        throw new ServiceException(
          'ENTITY_NOT_FOUND',
          'BAD_REQUEST',
          `not found : ${dto.artistName}`,
        );
      }
      artist = artists[0];
    }
    //paintingName연결

    const result = await this.repo
      .createQueryBuilder()
      .insert()
      .into(Painting)
      .values([
        {
          title: dto.title,
          image_url: dto.image_url,
          description: dto.description,
          width: dto.width,
          height: dto.height,
          completition_year: dto.completition_year,
          artist,
          tags,
          styles,
        },
      ])
      .execute();

    const ret = { ...result.generatedMaps };

    return ret;
  }

  async searchPainting(dto: SearchPaintingDTO, page: number, paginationCount: number) {
    /*TODO
    - 입력된 tag와 style이 유효한지 점검하기
    */
    const targetTags = JSON.parse(dto.tags) as string[];
    const targetStyles = JSON.parse(dto.styles) as string[];
    Logger.debug(`tags : ${JSON.stringify(targetTags)}`);

    const subQueryFilterByTag = await this.repo
      .createQueryBuilder()
      .subQuery()
      .select('painting_tags.paintingId')
      .from('painting_tags_tag', 'painting_tags') // Many-to-Many 연결 테이블
      .innerJoin('tag', 'tag', 'tag.id = painting_tags.tagId') // 연결 테이블과 Tag JOIN
      .where('tag.name IN (:...tagNames)') // tagNames 필터링
      .groupBy('painting_tags.paintingId')
      .having('COUNT(DISTINCT tag.id) = :tagCount') // 정확한 태그 갯수 매칭
      .getQuery();

    const subQueryFilterByStyle = await this.repo
      .createQueryBuilder()
      .subQuery()
      .select('painting_styles.paintingId')
      .from('painting_styles_style', 'painting_styles') // Many-to-Many 연결 테이블
      .innerJoin('style', 'style', 'style.id = painting_styles.styleId')
      .where('style.name IN (:...styleNames)')
      .groupBy('painting_styles.paintingId')
      .having('COUNT(DISTINCT style.id) = :styleCount')
      .getQuery();

    const mainQuery = await this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.tags', 'tag')
      .leftJoinAndSelect('p.styles', 'style')
      .leftJoinAndSelect('p.artist', 'artist')
      .where("p.title like '%' || :title || '%'", { title: dto.title })
      .andWhere("artist.name like '%' || :artist || '%'", {
        artist: dto.artistName,
      });

    if (targetTags.length > 0) {
      mainQuery.andWhere(`p.id IN ${subQueryFilterByTag}`, {
        tagNames: targetTags,
        tagCount: targetTags.length,
      });
    }

    if (targetStyles.length > 0) {
      mainQuery.andWhere(`p.id IN ${subQueryFilterByStyle}`, {
        styleNames: targetStyles,
        styleCount: targetStyles.length,
      });
    }

    Logger.debug(mainQuery.getSql());

    const result = mainQuery
      .skip(page * paginationCount)
      .take(paginationCount)
      .getMany();

    return result;
  }
  async searchPaintingByTitleAndArtist(
    title: string,
    artistName: string,
    page: number,
    paginationCount: number,
  ) {
    const result = await this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.artist', 'artist')
      .leftJoinAndSelect('p.tags', 'tag')
      .where("p.title like '%' || :title || '%'", { title })
      .andWhere("artist.name like '%' || :artist || '%'", {
        artist: artistName,
      })
      .skip(page * paginationCount)
      .take(paginationCount)
      .printSql()
      .getMany();
    return result;
  }

  async findPaintingsByTags(tagNames: string[]) {
    if (tagNames.length === 0) {
      return []; // 빈 배열이 들어오면 빈 결과 반환
    }

    const paintings = await this.repo
      .createQueryBuilder('painting')
      .innerJoinAndSelect('painting.tags', 'tag') // Painting과 Tag를 JOIN
      .where((qb) => {
        // 서브쿼리 사용
        const subQuery = qb
          .subQuery()
          .select('painting_tags.paintingId')
          .from('painting_tags_tag', 'painting_tags') // Many-to-Many 연결 테이블
          .innerJoin('tag', 'tag', 'tag.id = painting_tags.tagId') // 연결 테이블과 Tag JOIN
          .where('tag.name IN (:...tagNames)', { tagNames }) // tagNames 필터링
          .groupBy('painting_tags.paintingId')
          .having('COUNT(DISTINCT tag.id) = :tagCount') // 정확한 태그 갯수 매칭
          .getQuery();
        return `painting.id IN ${subQuery}`;
      })
      .setParameter('tagCount', tagNames.length) // 태그 갯수 설정
      .getMany();

    return paintings;
  }

  /*************  ✨ Codeium Command ⭐  *************/
  /**
   *
   * @param key WikiArtPainting Entity의 key
   * @param excludedValues  제외할 값
   * @param includedValues  포함할 값
   * @returns Painting[]
   */
  /******  7b1afc31-0542-411c-94f9-2f84df44ce08  *******/
  async searchPaintingWithoutAndWithValue(
    key: keyof WikiArtPainting,
    excludedValues: string[],
    includedValues: string[],
  ): Promise<Painting[]> {
    const painting = new WikiArtPainting();

    excludedValues = excludedValues.filter((value) => value !== '');
    if (isArrayEmpty(excludedValues)) {
      const dumpString = 'n1e1ve1e1r^Co1n1ta1i1ned';
      excludedValues = [dumpString];
    }

    if (isArray(painting[key])) {
      const result = await this.repo
        .createQueryBuilder('painting')
        .leftJoinAndSelect('painting.wikiArtPainting', 'wikiArtPainting')
        .where(`NOT (wikiArtPainting.${key} @> :excludedValues)`, { excludedValues })
        .andWhere(`wikiArtPainting.${key} @> :includedValues`, {
          includedValues,
        })
        .getMany();

      return result;
    }

    const queryBuilder = await this.repo
      .createQueryBuilder('painting')
      .leftJoinAndSelect('painting.wikiArtPainting', 'wikiArtPainting');

    excludedValues.forEach((excludedValue, index) => {
      queryBuilder.andWhere(`wikiArtPainting.${key} NOT LIKE :excludedValue${index}`, {
        [`excludedValue${index}`]: `%${excludedValue}%`,
      });
    });

    /* TODO
    - 반환 배열의 개수를 지정해야함.  
    */

    includedValues.forEach((includedValue, index) => {
      queryBuilder.andWhere(`wikiArtPainting.${key} LIKE :includedValue${index}`, {
        [`includedValue${index}`]: `%${includedValue}%`,
      });
    });

    return queryBuilder.getMany();
  }

  //wikiArt functions
  async getWikiArtInfo(id: string) {
    const entity = await this.findOne({
      where: { id },
    });

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
    const updatedEntity = await this.repo.preload(partialEntity);
    Logger.debug(`[updateWikiArt] partialEntity : ${JSON.stringify(partialEntity, null, 2)}`);

    if (updatedEntity == undefined) {
      throw new ServiceException(
        'ENTITY_NOT_FOUND',
        'BAD_REQUEST',
        `id : ${id} ,\n dto  : ${JSON.stringify(dto, null, 2)}`,
      );
    }

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
