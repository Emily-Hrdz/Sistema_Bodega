import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBodegaDiferenciaDto } from './dto/create-bodega-diferencia.dto';
import { UpdateBodegaDiferenciaDto } from './dto/update-bodega-diferencia.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BodegaDiferenciaService {
  constructor(private prisma: PrismaService) {}

  async create(createBodegaDiferenciaDto: CreateBodegaDiferenciaDto) {
    const cantidadSistema = new Decimal(createBodegaDiferenciaDto.cantidadSistema);
    const cantidadFisica = new Decimal(createBodegaDiferenciaDto.cantidadFisica);
    const diferencia = cantidadFisica.sub(cantidadSistema);

    return this.prisma.bodegaDiferencia.create({
      data: {
        ...createBodegaDiferenciaDto,
        fechaConteo: new Date(createBodegaDiferenciaDto.fechaConteo),
        cantidadSistema,
        cantidadFisica,
        diferencia,
      },
      include: {
        bodega: true,
      },
    });
  }

  async findAll() {
    return this.prisma.bodegaDiferencia.findMany({
      include: {
        bodega: true,
      },
      orderBy: { fechaConteo: 'desc' },
    });
  }

  async findOne(id: number) {
    const bodegaDiferencia = await this.prisma.bodegaDiferencia.findUnique({
      where: { id },
      include: {
        bodega: true,
      },
    });

    if (!bodegaDiferencia) {
      throw new NotFoundException(`Diferencia de Bodega con ID ${id} no encontrada`);
    }

    return bodegaDiferencia;
  }

  async findByBodega(bodegaId: number) {
    return this.prisma.bodegaDiferencia.findMany({
      where: { bodegaId },
      include: {
        bodega: true,
      },
      orderBy: { fechaConteo: 'desc' },
    });
  }

  async update(id: number, updateBodegaDiferenciaDto: UpdateBodegaDiferenciaDto) {
    await this.findOne(id);

    let diferencia: Decimal | undefined;
    if (
      updateBodegaDiferenciaDto.cantidadSistema !== undefined &&
      updateBodegaDiferenciaDto.cantidadFisica !== undefined
    ) {
      const cantidadSistema = new Decimal(updateBodegaDiferenciaDto.cantidadSistema);
      const cantidadFisica = new Decimal(updateBodegaDiferenciaDto.cantidadFisica);
      diferencia = cantidadFisica.sub(cantidadSistema);
    }

    return this.prisma.bodegaDiferencia.update({
      where: { id },
      data: {
        ...updateBodegaDiferenciaDto,
        fechaConteo: updateBodegaDiferenciaDto.fechaConteo
          ? new Date(updateBodegaDiferenciaDto.fechaConteo)
          : undefined,
        diferencia,
      },
      include: {
        bodega: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.bodegaDiferencia.delete({
      where: { id },
    });
  }
}