import { Crud, CrudController } from '@dataui/crud';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePaintingDTO } from './dto/create-painting.dto';
import { SearchPaintingDTO } from './dto/search-painting.dto';
import { Painting } from './entities/painting.entity';
import { PaintingService } from './painting.service';
import { IPaginationResult } from './responseDTO';

@Crud({
  model: {
    type: Painting,
  },
  routes: {
    only: ['getOneBase'],
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  query: {
    join: {
      artist: {
        eager: true,
      },
      tags: {
        eager: true,
      },
    },
  },
})
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('painting')
export class PaintingController implements CrudController<Painting> {
  constructor(public service: PaintingService) {}

  @Get('/')
  async searchPainting(
    @Query() dto: SearchPaintingDTO,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
  ) {
    const paginationCount = 50;
    const data: Painting[] = await this.service.searchPainting(dto, page, paginationCount);

    const ret: IPaginationResult<Painting> = {
      data,
      isMore: data.length === paginationCount,
      count: data.length,
      pagination: page,
    };

    return ret;
  }

  @Get('values/:columnName')
  async getColumnValues(@Param('columnName') columnName: string) {
    /*TODO
    - columnName 검증 pipe 데코레이터 구현 필요
      - PaintingTable 내에 존재하는 column 이름인지 확인 필요
    */
    const map = await this.service.getColumnValueMap(columnName as keyof Painting);

    return [...map.values()];
  }

  @Post()
  createPainting(@Body() body: CreatePaintingDTO) {
    Logger.debug(`[createPainting] ${JSON.stringify(body)}`);
    return this.service.create(body);
  }
}
