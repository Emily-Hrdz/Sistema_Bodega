import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(private prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {
    return this.prisma.producto.create({
      data: createProductoDto,
      include: { tipoProducto: true },
    });
  }

  async findAll() {
    return this.prisma.producto.findMany({
      include: { tipoProducto: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        tipoProducto: true,
        kardex: {
          take: 10,
          orderBy: { fecha: 'desc' },
        },
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    await this.findOne(id);
    return this.prisma.producto.update({
      where: { id },
      data: updateProductoDto,
      include: { tipoProducto: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.producto.delete({
      where: { id },
    });
  }
}