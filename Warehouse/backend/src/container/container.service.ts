import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';

@Injectable()
export class ContainerService {
  constructor(private prisma: PrismaService) {}

  async create(createContainerDto: CreateContainerDto) {
    return this.prisma.container.create({
      data: createContainerDto,
    });
  }

  async findAll() {
    return this.prisma.container.findMany({
      orderBy: { codigo: 'asc' },
    });
  }

  async findOne(id: number) {
    const container = await this.prisma.container.findUnique({
      where: { id },
    });

    if (!container) {
      throw new NotFoundException(`Container con ID ${id} no encontrado`);
    }

    return container;
  }

  async update(id: number, updateContainerDto: UpdateContainerDto) {
    await this.findOne(id);
    return this.prisma.container.update({
      where: { id },
      data: updateContainerDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.container.delete({
      where: { id },
    });
  }
}