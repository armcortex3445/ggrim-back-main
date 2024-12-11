import { Crud, CrudController } from '@dataui/crud';
import { Controller } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { CreateArtistDTO } from './dto/create-artist.dto';
import { Artist } from './entities/artist.entity';
const EXCLUDED_COLUMN = ['created_date', 'updated_date', 'deleted_date', 'version'] as const;
@Crud({
  model: {
    type: Artist,
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase', 'replaceOneBase', 'deleteOneBase'],
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  dto: {
    create: CreateArtistDTO,
    replace: CreateArtistDTO,
  },
  query: {
    allow: ['id', 'name', 'info_url', 'birth_date', 'death_date'],
    exclude: [...EXCLUDED_COLUMN],
    join: {
      paintings: {
        eager: true,
        persist: ['id', 'title', 'image_url'],
        exclude: [...EXCLUDED_COLUMN, 'width', 'height', 'completition_year', 'description'],
      },
    },
    softDelete: true,
    alwaysPaginate: true,
  },
})
@Controller('artist')
export class ArtistController implements CrudController<Artist> {
  constructor(public service: ArtistService) {}
}
