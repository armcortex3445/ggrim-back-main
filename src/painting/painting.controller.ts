import { Crud, CrudController } from '@dataui/crud';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePaintingDTO } from './dto/create-painting.dto';
import { FindPaintingDTO } from './dto/find-painting.dto';
import { SearchPaintingDTO } from './dto/search-painting.dto';
import { UpdateWikiArtInfoDTO } from './dto/update-wikiArt-info.dto';
import { Painting } from './entities/painting.entity';
import { WikiArtPainting } from './entities/wikiArt-painting.entity';
import { IResult, PaintingService } from './painting.service';

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

  @Get('search/:key')
  async searchPaintingWithKey(
    @Param('key') key: string,
    @Query('exclusion') exclusion: string,
    @Query('inclusion') inclusion: string,
  ) {
    return this.service.searchPaintingWithoutAndWithValue(
      key as keyof WikiArtPainting,
      JSON.parse(exclusion) as string[],
      JSON.parse(inclusion) as string[],
    );
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
  createPainting(@Body() body: CreatePaintingDTO) {
    Logger.debug(`[createPainting] ${JSON.stringify(body)}`);
    return this.service.create(body);
  }

  //related to wiki-art
  @Get(':id/wiki-art')
  async findWikiArtInfo(@Param('id') id: string) {
    return this.service.getWikiArtInfo(id);
  }

  @Patch(':id/wiki-art')
  updateWikiArtInfo(@Param('id') id: string, @Body() updateWikiArtInfo: UpdateWikiArtInfoDTO) {
    return this.service.updateWikiArt(id, updateWikiArtInfo);
  }
}
