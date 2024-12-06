import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceException } from '../_common/filter/exception/service/service-exception';
import { ArtistService } from '../artist/artist.service';
import { Artist } from '../artist/entities/artist.entity';
import { isArrayEmpty, isNotFalsy } from '../utils/validator';
import { CreatePaintingDTO } from './dto/create-painting.dto';
import { SearchPaintingDTO } from './dto/search-painting.dto';
import { Painting } from './entities/painting.entity';
import { Style } from './entities/style.entity';
import { Tag } from './entities/tag.entity';
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
export class PaintingService {
  constructor(
    @InjectRepository(Painting) private readonly repo: Repository<Painting>,
    @Inject(TagService) private readonly tagService: TagService,
    @Inject(StyleService) private readonly styleService: StyleService,
    @Inject(ArtistService) private readonly artistService: ArtistService,
  ) {}
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
  async getPaintingsByArtist(artistName: string) {
    const result = await this.repo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.artist', 'artist')
      .innerJoinAndSelect('p.tags', 'tag')
      .innerJoinAndSelect('p.styles', 'style')
      .where('artist.name  = :artist', {
        artist: artistName,
      })
      .getMany();
    return result;
  }

  async getPaintingsByTags(tagNames: string[]) {
    if (tagNames.length === 0) {
      return []; // 빈 배열이 들어오면 빈 결과 반환
    }

    const paintings = await this.repo
      .createQueryBuilder('painting')
      .innerJoinAndSelect('painting.artist', 'artist')
      .innerJoinAndSelect('painting.tags', 'tag')
      .innerJoinAndSelect('painting.styles', 'style')
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

  async getByIds(ids: string[]): Promise<Painting[]> {
    const query = this.repo.createQueryBuilder('p').select().where('p.id IN (:...ids)', { ids });

    Logger.debug(query.getSql());

    const paintings: Painting[] = await query.getMany();

    if (paintings.length !== ids.length) {
      const foundIds = paintings.map((p) => p.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      throw new ServiceException(
        'ENTITY_NOT_FOUND',
        'BAD_REQUEST',
        `Can Not found ids : ${JSON.stringify(notFoundIds)}`,
      );
    }
    return paintings;
  }

  validatePaintingEntity(painting: Painting): boolean {
    if (!painting) return false;

    if (!painting.id) return false;

    return true;
  }

  async getColumnValueMap(column: keyof Painting): Promise<Map<string, any>> {
    const map = new Map<string, any>();

    if (column === 'artist') {
      const artists = await this.artistService.getArtistsHavingPainting();

      artists.forEach((artist) => {
        if (!map.has(artist.id)) {
          map.set(artist.id, artist.name);
        }
      });
    }

    if (column === 'tags') {
      const tags = await this.tagService.getTagsRelatedToPainting();
      tags.forEach((tag) => {
        if (!map.has(tag.id)) {
          map.set(tag.id, tag.name);
        }
      });
    }

    if (column === 'styles') {
      const styles = await this.styleService.getStylesRelatedToPainting();
      styles.forEach((style) => {
        if (!map.has(style.id)) {
          map.set(style.id, style.name);
        }
      });
    }

    return map;
  }

  async validateColumnValue(column: keyof Painting, value: any) {
    if (column === 'artist') {
      this.artistService.validateName(value);
    }
  }
}
