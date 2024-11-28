import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';

@Injectable()
export class ArtistService extends TypeOrmCrudService<Artist> {
  constructor(@InjectRepository(Artist) repo: Repository<Artist>) {
    super(repo);
  }
}
