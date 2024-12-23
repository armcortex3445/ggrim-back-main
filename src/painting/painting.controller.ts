import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { DBQueryRunner } from '../db/query-runner/decorator/query-runner.decorator';
import { QueryRunnerInterceptor } from '../db/query-runner/query-runner.interceptor';
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
  @UseInterceptors(QueryRunnerInterceptor)
  async createPainting(@DBQueryRunner() queryRunner: QueryRunner, @Body() body: CreatePaintingDTO) {
    try {
      const newPaintingWithoutRelations = await this.service.create(queryRunner, body);
      return newPaintingWithoutRelations;
    } catch (error: any) {
      /*TODO
        - 비동기 함수의 에러를 캐치할수 있도록, await를 명시하도록 컨벤션을 정해야함.
         - async 함수 내에서 에러가 발생한다면, await를 하지 않는 경우, try-catch문으로 에러를 캐치할수 없다.
         - 방법1) prettier를 사용하여 promise를 처리하도록 규칙을 강제한다.
      */
      Logger.error(`[createPainting] ${JSON.stringify(error)}`);
      throw error;
    }
  }

  @Put('/:id')
  @UseInterceptors(QueryRunnerInterceptor)
  async replacePainting(
    @DBQueryRunner() queryRunner: QueryRunner,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplacePaintingDTO,
  ) {
    const targetPainting = await this.service.findPaintingOrThrow(id);

    return this.service.replace(queryRunner, targetPainting, dto);
  }

  @Delete('/:id')
  @UseInterceptors(QueryRunnerInterceptor)
  async deletePainting(
    @DBQueryRunner() queryRunner: QueryRunner,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const targetPainting = await this.service.findPaintingOrThrow(id);
    return this.service.deleteOne(queryRunner, targetPainting);
  }
}
