import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isArrayEmpty } from '../../utils/validator';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagService extends TypeOrmCrudService<Tag> {
  constructor(@InjectRepository(Tag) readonly repo: Repository<Tag>) {
    super(repo);
  }

  async findManyByName(names: string[]): Promise<Tag[]> {
    if (isArrayEmpty(names)) {
      return [];
    }

    const tags = await this.repo
      .createQueryBuilder('tag')
      .where('tag.name IN (:...names)', { names })
      .getMany();

    return tags;
  }

  async getTagsRelatedToPainting() {
    const query = this.repo
      .createQueryBuilder('t')
      .innerJoin('t.paintings', 'painting')
      .select(['t.name', 't.id']);

    Logger.debug(query.getSql());

    return await query.getMany();
  }
}
