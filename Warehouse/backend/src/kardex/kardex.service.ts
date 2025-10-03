import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKardexDto } from './dto/create-kardex.dto';
import { UpdateKardexDto } from './dto/update-kardex.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class KardexService {
  constructor(private prisma: PrismaService) {}

  async create(createKardexDto: CreateKardexDto) {
    // Obtener el saldo actual
    const saldoActual = await this.getSaldoActual(
      createKardexDto.bodegaId,
      createKardexDto.productoId,
    );

    // Obtener el tipo de movimiento
    const tipoMovimiento = await this.prisma.tipoMovimiento.findUnique({
      where: { id: createKardexDto.tipoMovimientoId },
    });

    if (!tipoMovimiento) {
      throw new NotFoundException('Tipo de movimiento no encontrado');
    }

    // Calcular nuevo saldo
    let nuevoSaldo: Decimal;
    const cantidad = new Decimal(createKardexDto.cantidad);

    if (tipoMovimiento.tipo === 'ENTRADA') {
      nuevoSaldo = saldoActual.add(cantidad);
    } else {
      nuevoSaldo = saldoActual.sub(cantidad);
      if (nuevoSaldo.isNegative()) {
        throw new BadRequestException('Saldo insuficiente para realizar la salida');
      }
    }

    // Crear el movimiento
    return this.prisma.kardex.create({
      data: {
        ...createKardexDto,
        fecha: createKardexDto.fecha ? new Date(createKardexDto.fecha) : new Date(),
        cantidad: cantidad,
        saldoAnterior: saldoActual,
        saldoNuevo: nuevoSaldo,
      },
      include: {
        bodega: true,
        producto: true,
        container: true,
        lote: true,
        cliente: true,
        tipoMovimiento: true,
      },
    });
  }

  async findAll() {
    return this.prisma.kardex.findMany({
      include: {
        bodega: true,
        producto: true,
        container: true,
        lote: true,
        cliente: true,
        tipoMovimiento: true,
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    });
  }

  async findOne(id: number) {
    const kardex = await this.prisma.kardex.findUnique({
      where: { id },
      include: {
        bodega: true,
        producto: true,
        container: true,
        lote: true,
        cliente: true,
        tipoMovimiento: true,
      },
    });

    if (!kardex) {
      throw new NotFoundException(`Movimiento Kardex con ID ${id} no encontrado`);
    }

    return kardex;
  }

  async findByBodegaProducto(bodegaId: number, productoId: number) {
    return this.prisma.kardex.findMany({
      where: {
        bodegaId,
        productoId,
      },
      include: {
        bodega: true,
        producto: true,
        container: true,
        lote: true,
        cliente: true,
        tipoMovimiento: true,
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async getSaldoActual(bodegaId: number, productoId: number): Promise<Decimal> {
    const ultimoMovimiento = await this.prisma.kardex.findFirst({
      where: {
        bodegaId,
        productoId,
      },
      orderBy: { fecha: 'desc' },
    });

    return ultimoMovimiento ? ultimoMovimiento.saldoNuevo : new Decimal(0);
  }

  async update(id: number, updateKardexDto: UpdateKardexDto) {
    await this.findOne(id);
    return this.prisma.kardex.update({
      where: { id },
      data: {
        ...updateKardexDto,
        fecha: updateKardexDto.fecha ? new Date(updateKardexDto.fecha) : undefined,
      },
      include: {
        bodega: true,
        producto: true,
        container: true,
        lote: true,
        cliente: true,
        tipoMovimiento: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.kardex.delete({
      where: { id },
    });
  }
}