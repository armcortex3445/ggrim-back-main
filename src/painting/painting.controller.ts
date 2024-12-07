import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePaintingDTO } from './dto/create-painting.dto';
import { FindPaintingQueryDTO } from './dto/find-painting.query.dto';
import { ReplacePaintingDTO } from './dto/replace-painting.dto';
import { SearchPaintingDTO } from './dto/search-painting.dto';
import { Painting } from './entities/painting.entity';
import { PaintingService } from './painting.service';
import { IPaginationResult } from './responseDTO';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('painting')
export class PaintingController {
  constructor(@Inject(PaintingService) private readonly service: PaintingService) {}

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

  @Get('by-ids')
  async getById(@Query() dto: FindPaintingQueryDTO) {
    return this.service.getByIds(dto.ids);
  }

  @Post()
  createPainting(@Body() body: CreatePaintingDTO) {
    Logger.debug(`[createPainting] ${JSON.stringify(body)}`);
    return this.service.create(body);
  }

  @Put('/:id')
  async replacePainting(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReplacePaintingDTO) {
    const targetPainting = (await this.service.getByIds([id]))[0];

    return this.service.replace(targetPainting, dto);
  }
}
