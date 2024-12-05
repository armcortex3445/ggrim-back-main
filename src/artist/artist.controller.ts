import { Crud, CrudController } from '@dataui/crud';
import { Controller } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { Artist } from './entities/artist.entity';

@Crud({
  model: {
    type: Artist,
  },
  routes: {
    only: ['getOneBase', 'updateOneBase'],
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  query: {
    allow: ['id', 'name', 'info_url'],
    exclude: ['created_date'],
    join: {
      paintings: {
        eager: true,
      },
    },
  },
})
@Controller('artist')
export class ArtistController implements CrudController<Artist> {
  constructor(public service: ArtistService) {}
}
