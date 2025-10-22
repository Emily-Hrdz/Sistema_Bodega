import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards, 
} from '@nestjs/common';
import { TipoMovimientoService } from './tipo-movimiento.service';
import { CreateTipoMovimientoDto } from './dto/create-tipo-movimiento.dto';
import { UpdateTipoMovimientoDto } from './dto/update-tipo-movimiento.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('api/tipos-movimiento')
@UseGuards(JwtAuthGuard)
export class TipoMovimientoController {
  constructor(private readonly tipoMovimientoService: TipoMovimientoService) {}

  @Post()
  create(@Body() createTipoMovimientoDto: CreateTipoMovimientoDto) {
    return this.tipoMovimientoService.create(createTipoMovimientoDto);
  }

  @Get()
  findAll() {
    return this.tipoMovimientoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoMovimientoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoMovimientoDto: UpdateTipoMovimientoDto,
  ) {
    return this.tipoMovimientoService.update(id, updateTipoMovimientoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoMovimientoService.remove(id);
  }
}