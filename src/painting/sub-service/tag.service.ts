import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
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
}
