import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';

@Injectable()
export class BodegaService {
  constructor(private prisma: PrismaService) {}

  async create(createBodegaDto: CreateBodegaDto) {
    return this.prisma.bodega.create({
      data: createBodegaDto,
    });
  }

  async findAll() {
    return this.prisma.bodega.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const bodega = await this.prisma.bodega.findUnique({
      where: { id },
      include: {
        kardex: {
          take: 10,
          orderBy: { fecha: 'desc' },
        },
      },
    });

    if (!bodega) {
      throw new NotFoundException(`Bodega con ID ${id} no encontrada`);
    }

    return bodega;
  }

  async update(id: number, updateBodegaDto: UpdateBodegaDto) {
    await this.findOne(id);
    return this.prisma.bodega.update({
      where: { id },
      data: updateBodegaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.$transaction(async tx => {
        const movimientos = await tx.kardex.count({ where: { bodegaId: id } });
        const diferencias = await tx.bodegaDiferencia.count({ where: { bodegaId: id } });
        if (movimientos || diferencias) {
          throw new ConflictException('Este registro tiene movimientos o conteos asociados. Desactívelo para conservar el historial.');
        }
        return tx.bodega.delete({ where: { id } });
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (error.code === 'P2003' || error.code === 'P2034') {
        throw new ConflictException('No se puede eliminar: el registro está en uso. Actualice la lista o desactívelo.');
      }
      throw error;
    }
  }
}
