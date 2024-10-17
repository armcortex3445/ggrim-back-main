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

@Crud({
  model: {
    type: Painting,
  },
})
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('painting')
export class PaintingController implements CrudController<Painting> {
  constructor(public service: PaintingService) {}

  @Get()
  async findPainting(@Query() query: FindPaintingDTO, @Query('page') page: number) {
    Logger.debug(`Is Query from FindPaintingDTO? : ${query instanceof FindPaintingDTO}`);

    if (query.id) {
      const ret: IResult<Painting> = {
        data: await this.service.findOneBy({ id: query.id }),
      };
    }
    return this.service.findPaintingByTitle(query.title, query.wikiArtID, page || 0);
  }

  @Post()
  createPainting(@Body() body: CreatePaintingDto) {
    Logger.debug(`[createPainting] ${JSON.stringify(body)}`);
    return this.service.create(body);
  }

  @Patch(':id/wikiArt')
  updateWikiArtInfo(@Param('id') id: string, @Body() updateWikiArtInfo: UpdateWikiArtInfoDTO) {
    return this.service.updateWikiArt(id, updateWikiArtInfo);
  }
}
