import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Logger,
  ParseIntPipe,
  Query,
  ParseUUIDPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { IResult, PaintingService } from './painting.service';
import { CreatePaintingDto } from './dto/create-painting.dto';
import { UpdatePaintingDto } from './dto/update-painting.dto';
import { Crud, CrudController } from '@dataui/crud';
import { Painting } from './entities/painting.entity';
import { FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';
import { CreateArtistDto } from 'src/artist/dto/create-artist.dto';
import { FindPaintingDTO } from './dto/find-painting.dto';
import { UpdateWikiArtInfoDTO } from './dto/update-wikiArt-info.dto';
import { SearchPaintingDTO } from './dto/search-painting.dto';

@Crud({
  model: {
    type: Painting,
  },
})
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('painting')
export class PaintingController implements CrudController<Painting> {
  constructor(public service: PaintingService) {}

  @Get('search')
  async searchPainting(
    @Query() dto: SearchPaintingDTO,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
  ) {
    return this.service.searchPainting(dto, page);
  }
  @Get()
  async findPainting(@Query() query: FindPaintingDTO) {
    if (query.id) {
      Logger.debug('find entity with id :' + query.id);
      const ret: IResult<Painting> = {
        data: await this.service.findOneById(query.id),
      };

      return ret;
    }
    return this.service.findPainting(query.wikiArtID);
  }

  @Post()
  createPainting(@Body() body: CreatePaintingDto) {
    Logger.debug(`[createPainting] ${JSON.stringify(body)}`);
    return this.service.create(body);
  }

  //related to wiki-art
  @Get(':id/wiki-art')
  async findWikiArtInfo(@Param('id') id: string) {
    return this.service.getwikiArtInfo(id);
  }

  @Patch(':id/wiki-art')
  updateWikiArtInfo(@Param('id') id: string, @Body() updateWikiArtInfo: UpdateWikiArtInfoDTO) {
    return this.service.updateWikiArt(id, updateWikiArtInfo);
  }
}
