import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoProductoDto } from './dto/create-tipo-producto.dto';
import { UpdateTipoProductoDto } from './dto/update-tipo-producto.dto';

@Injectable()
export class TipoProductoService {
  constructor(private prisma: PrismaService) {}

  async create(createTipoProductoDto: CreateTipoProductoDto) {
    return this.prisma.tipoProducto.create({
      data: createTipoProductoDto,
    });
  }

  async findAll() {
    return this.prisma.tipoProducto.findMany({
      include: { _count: { select: { productos: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const tipoProducto = await this.prisma.tipoProducto.findUnique({
      where: { id },
      include: { productos: true },
    });

    if (!tipoProducto) {
      throw new NotFoundException(`Tipo de Producto con ID ${id} no encontrado`);
    }

    return tipoProducto;
  }

  async update(id: number, updateTipoProductoDto: UpdateTipoProductoDto) {
    await this.findOne(id);
    return this.prisma.tipoProducto.update({
      where: { id },
      data: updateTipoProductoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tipoProducto.delete({
      where: { id },
    });
  }
}