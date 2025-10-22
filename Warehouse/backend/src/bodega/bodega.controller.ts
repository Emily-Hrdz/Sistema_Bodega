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
import { BodegaService } from './bodega.service';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('api/bodegas')
@UseGuards(JwtAuthGuard) 
export class BodegaController {
  constructor(private readonly bodegaService: BodegaService) {}

  @Post()
  create(@Body() createBodegaDto: CreateBodegaDto) {
    return this.bodegaService.create(createBodegaDto);
  }

  @Get()
  findAll() {
    return this.bodegaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bodegaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBodegaDto: UpdateBodegaDto,
  ) {
    return this.bodegaService.update(id, updateBodegaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bodegaService.remove(id);
  }
}