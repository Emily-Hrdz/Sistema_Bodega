import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoMovimientoDto } from './dto/create-tipo-movimiento.dto';
import { UpdateTipoMovimientoDto } from './dto/update-tipo-movimiento.dto';

@Injectable()
export class TipoMovimientoService {
  constructor(private prisma: PrismaService) {}

  async create(createTipoMovimientoDto: CreateTipoMovimientoDto) {
    return this.prisma.tipoMovimiento.create({
      data: createTipoMovimientoDto,
    });
  }

  async findAll() {
    return this.prisma.tipoMovimiento.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const tipoMovimiento = await this.prisma.tipoMovimiento.findUnique({
      where: { id },
    });

    if (!tipoMovimiento) {
      throw new NotFoundException(`Tipo de Movimiento con ID ${id} no encontrado`);
    }

    return tipoMovimiento;
  }

  async update(id: number, updateTipoMovimientoDto: UpdateTipoMovimientoDto) {
    await this.findOne(id);
    return this.prisma.tipoMovimiento.update({
      where: { id },
      data: updateTipoMovimientoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tipoMovimiento.delete({
      where: { id },
    });
  }
}