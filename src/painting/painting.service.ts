import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceException } from '../_common/filter/exception/service/service-exception';
import { ArtistService } from '../artist/artist.service';
import { Artist } from '../artist/entities/artist.entity';
import { isArrayEmpty, isFalsy, isNotFalsy } from '../utils/validator';
import { Style } from './child-module/style/entities/style.entity';
import { StyleService } from './child-module/style/style.service';
import { Tag } from './child-module/tag/entities/tag.entity';
import { TagService } from './child-module/tag/tag.service';
import { CreatePaintingDTO } from './dto/create-painting.dto';
import { SearchPaintingDTO } from './dto/search-painting.dto';
import { Painting } from './entities/painting.entity';

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
  async create(dto: CreatePaintingDTO): Promise<Painting> {
    let artist: Artist | undefined = undefined;

    const query = this.repo
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
        },
      ]);

    Logger.debug(`[create] ${query.getSql()}`);
    const result = await query.execute();
    const newPainting: Painting = result.generatedMaps[0] as Painting;
    if (isNotFalsy(dto.artistName)) {
      this.setArtist(newPainting, dto.artistName);
    }

    if (isNotFalsy(dto.styles) && !isArrayEmpty(dto.styles)) {
      await this.relateToStyle(newPainting, dto.styles);
    }

    if (isNotFalsy(dto.tags) && !isArrayEmpty(dto.tags)) {
      await this.relateToTag(newPainting, dto.tags);
    }

    const newPaintingFromDB = (await this.getByIds([newPainting.id]))[0];

    return newPaintingFromDB;
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
    const query = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.tags', 'tags')
      .leftJoinAndSelect('p.styles', 'styles')
      .leftJoinAndSelect('p.artist', 'artist')
      .where('p.id IN (:...ids)', { ids });

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

  async relateToTag(painting: Painting, tagNames: string[]): Promise<void> {
    const tagNamesToAdd: string[] = tagNames.filter(
      (name) => !painting.tags.some((tag) => tag.name === name),
    );

    if (isArrayEmpty(tagNamesToAdd)) {
      return;
    }

    const tags: Tag[] = await this.getTagsByName(tagNames);

    const query = this.repo.createQueryBuilder().relation(Painting, 'tags').of(painting);

    Logger.debug(`[insert tag] : ${query.getSql()}`);

    await query.add(tags);
  }

  async notRelateToTag(painting: Painting, tagNames: string[]) {
    const tags: Tag[] = await this.getTagsByName(tagNames);
    const query = this.repo.createQueryBuilder().relation(Painting, 'tags').of(painting);

    await query.remove(tags);
  }

  async relateToStyle(painting: Painting, styleNames: string[]): Promise<void> {
    const styleNamesToAdd: string[] = styleNames.filter(
      (name) => !painting.styles.some((style) => style.name === name),
    );

    if (isArrayEmpty(styleNamesToAdd)) {
      return;
    }

    const stylesToAdd: Style[] = await this.getStylesByName(styleNames);

    const query = this.repo.createQueryBuilder().relation(Painting, 'styles').of(painting);

    Logger.debug(`[insert styles] : ${query.getSql()}`);

    await query.add(stylesToAdd);
  }

  async notRelateToStyle(painting: Painting, styleNames: string[]): Promise<void> {
    const stylesToOmit: Style[] = await this.getStylesByName(styleNames);

    const query = this.repo.createQueryBuilder().relation(Painting, 'styles').of(painting);

    await query.remove(stylesToOmit);
  }

  async setArtist(painting: Painting, artistName: string | undefined) {
    const query = this.repo.createQueryBuilder().relation(Painting, 'artist').of(painting);

    if (isFalsy(artistName)) {
      await query.set(null);
      return;
    }

    const artists = await this.artistService.find({
      where: { name: artistName },
    });

    if (artists.length > 1) {
      throw new ServiceException(
        'DB_INCONSISTENCY',
        'INTERNAL_SERVER_ERROR',
        `${artistName} is multiple.\n
      ${JSON.stringify(artists, null, 2)}`,
      );
    }

    if (isArrayEmpty(artists)) {
      throw new ServiceException(
        'ENTITY_NOT_FOUND',
        'BAD_REQUEST',
        `not found artist : ${artistName}`,
      );
    }
    const artist: Artist = artists[0];

    await query.set(artist);
  }

  async getStylesByName(styleNames: string[]): Promise<Style[]> {
    const delimiter = ', ';

    const styles: Style[] = [];
    const finds = await this.styleService.findManyByName(styleNames);
    styles.push(...finds);

    if (styleNames.length !== styles.length) {
      const stylesFounded = styles.map((style) => style.name);
      const stylesNotFounded = styleNames.filter((name) => !stylesFounded.includes(name));
      throw new ServiceException(
        'ENTITY_NOT_FOUND',
        'BAD_REQUEST',
        `not found styles : ${stylesNotFounded.join(delimiter)}`,
      );
    }

    return styles;
  }

  async getTagsByName(tagNames: string[]): Promise<Tag[]> {
    const funcName = this.notRelateToTag.name;
    const delimiter = ', ';
    const tags: Tag[] = [];

    const finds = await this.tagService.findManyByName(tagNames);
    tags.push(...finds);

    if (tagNames.length !== tags.length) {
      const tagsFounded = tags.map((tag) => tag.name);
      const tagsNotFounded = tagNames.filter((name) => !tagsFounded.includes(name));
      throw new ServiceException(
        'ENTITY_NOT_FOUND',
        'BAD_REQUEST',
        `[${funcName}]not found tags : ${tagsNotFounded.join(delimiter)}`,
      );
    }
    return tags;
  }
}
