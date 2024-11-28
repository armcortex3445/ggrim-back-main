import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isArrayEmpty } from '../../utils/validator';
import { Style } from '../entities/style.entity';

@Injectable()
export class StyleService extends TypeOrmCrudService<Style> {
  constructor(@InjectRepository(Style) readonly repo: Repository<Style>) {
    super(repo);
  }

  async findManyByName(names: string[]): Promise<Style[]> {
    if (isArrayEmpty(names)) {
      return [];
    }

    const tags = await this.repo
      .createQueryBuilder('style')
      .where('style.name IN (:...names)', { names })
      .getMany();

    return tags;
  }
}
