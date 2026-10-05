import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    try {
      return await this.prisma.$transaction(async tx => {
        const movimientos = await tx.kardex.count({ where: { productoId: id } });
        const diferencias = await tx.bodegaDiferencia.count({ where: { productoId: id } });
        if (movimientos || diferencias) {
          throw new ConflictException('Este registro tiene movimientos o conteos asociados. Desactívelo para conservar el historial.');
        }
        return tx.producto.delete({ where: { id } });
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (error.code === 'P2003' || error.code === 'P2034') {
        throw new ConflictException('No se puede eliminar: el registro está en uso. Actualice la lista o desactívelo.');
      }
      throw error;
    }
  }
}
