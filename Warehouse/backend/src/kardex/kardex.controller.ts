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
import { KardexService } from './kardex.service';
import { CreateKardexDto } from './dto/create-kardex.dto';
import { UpdateKardexDto } from './dto/update-kardex.dto';

@Controller('api/kardex')
export class KardexController {
  constructor(private readonly kardexService: KardexService) {}

  @Post()
  create(@Body() createKardexDto: CreateKardexDto) {
    return this.kardexService.create(createKardexDto);
  }

  @Get()
  findAll() {
    return this.kardexService.findAll();
  }

  @Get('saldo')
  getSaldo(
    @Query('bodegaId', ParseIntPipe) bodegaId: number,
    @Query('productoId', ParseIntPipe) productoId: number,
  ) {
    return this.kardexService.getSaldoActual(bodegaId, productoId);
  }

  @Get('bodega-producto')
  findByBodegaProducto(
    @Query('bodegaId', ParseIntPipe) bodegaId: number,
    @Query('productoId', ParseIntPipe) productoId: number,
  ) {
    return this.kardexService.findByBodegaProducto(bodegaId, productoId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kardexService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKardexDto: UpdateKardexDto,
  ) {
    return this.kardexService.update(id, updateKardexDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.kardexService.remove(id);
  }
}