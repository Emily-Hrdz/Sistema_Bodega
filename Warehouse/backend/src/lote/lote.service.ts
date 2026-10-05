import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

@Injectable()
export class LoteService {
  constructor(private prisma: PrismaService) {}

  async create(createLoteDto: CreateLoteDto) {
    return this.prisma.lote.create({
      data: {
        ...createLoteDto,
        fechaVencimiento: createLoteDto.fechaVencimiento
          ? new Date(createLoteDto.fechaVencimiento)
          : null,
      },
    });
  }

  async findAll() {
    return this.prisma.lote.findMany({
      orderBy: { codigo: 'asc' },
    });
  }

  async findOne(id: number) {
    const lote = await this.prisma.lote.findUnique({
      where: { id },
    });

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }

    return lote;
  }

  async update(id: number, updateLoteDto: UpdateLoteDto) {
    await this.findOne(id);
    return this.prisma.lote.update({
      where: { id },
      data: {
        ...updateLoteDto,
        fechaVencimiento: updateLoteDto.fechaVencimiento
          ? new Date(updateLoteDto.fechaVencimiento)
          : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.$transaction(async tx => {
        const movimientos = await tx.kardex.count({ where: { loteId: id } });
        if (movimientos) {
          throw new ConflictException('Este registro tiene movimientos o conteos asociados. Desactívelo para conservar el historial.');
        }
        return tx.lote.delete({ where: { id } });
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (error.code === 'P2003' || error.code === 'P2034') {
        throw new ConflictException('No se puede eliminar: el registro está en uso. Actualice la lista o desactívelo.');
      }
      throw error;
    }
  }
}
