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
import { TipoProductoService } from './tipo-producto.service';
import { CreateTipoProductoDto } from './dto/create-tipo-producto.dto';
import { UpdateTipoProductoDto } from './dto/update-tipo-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/tipos-productos')
@UseGuards(JwtAuthGuard)
export class TipoProductoController {
  constructor(private readonly tipoProductoService: TipoProductoService) {}

  @Post()
  create(@Body() createTipoProductoDto: CreateTipoProductoDto) {
    return this.tipoProductoService.create(createTipoProductoDto);
  }

  @Get()
  findAll() {
    return this.tipoProductoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoProductoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoProductoDto: UpdateTipoProductoDto,
  ) {
    return this.tipoProductoService.update(id, updateTipoProductoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoProductoService.remove(id);
  }
}
