import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BodegaDiferenciaService } from './bodega-diferencia.service';
import { CreateBodegaDiferenciaDto } from './dto/create-bodega-diferencia.dto';
import { UpdateBodegaDiferenciaDto } from './dto/update-bodega-diferencia.dto';

@Controller('api/bodegas-diferencias')
export class BodegaDiferenciaController {
  constructor(private readonly bodegaDiferenciaService: BodegaDiferenciaService) {}

  @Post()
  create(@Body() createBodegaDiferenciaDto: CreateBodegaDiferenciaDto) {
    return this.bodegaDiferenciaService.create(createBodegaDiferenciaDto);
  }

  @Get()
  findAll(@Query('bodegaId') bodegaId?: string) {
    if (bodegaId) {
      return this.bodegaDiferenciaService.findByBodega(parseInt(bodegaId));
    }
    return this.bodegaDiferenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bodegaDiferenciaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBodegaDiferenciaDto: UpdateBodegaDiferenciaDto,
  ) {
    return this.bodegaDiferenciaService.update(id, updateBodegaDiferenciaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bodegaDiferenciaService.remove(id);
  }
}