import { Crud, CrudController } from '@dataui/crud';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateTagDTO } from './dto/create-tag.dto';
import { ReplaceTagDTO } from './dto/replace-tag.dto';
import { Tag } from './entities/tag.entity';
import { TagService } from './tag.service';
const EXCLUDED_COLUMN = ['created_date', 'updated_date', 'deleted_date', 'version'] as const;

@Crud({
  model: {
    type: Tag,
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase', 'replaceOneBase', 'deleteOneBase'],
  },
  dto: {
    create: CreateTagDTO,
    replace: ReplaceTagDTO,
  },
  query: {
    join: {
      paintings: {
        eager: true,
        exclude: [...EXCLUDED_COLUMN, 'width', 'height', 'completition_year', 'description'],
        persist: ['id', 'title', 'image_url'],
      },
    },
    allow: ['name'],
    exclude: [...EXCLUDED_COLUMN],
    persist: ['name', 'info_url'],
    softDelete: true,
    alwaysPaginate: true,
  },
})
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('painting/tag')
export class TagController implements CrudController<Tag> {
  constructor(public service: TagService) {}

  get base(): CrudController<Tag> {
    return this;
  }
}
