import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.prisma.bodega.delete({
      where: { id },
    });
  }
}