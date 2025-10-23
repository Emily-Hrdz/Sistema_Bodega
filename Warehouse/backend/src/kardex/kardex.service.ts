import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKardexDto } from './dto/create-kardex.dto';
import { UpdateKardexDto } from './dto/update-kardex.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class KardexService {
  constructor(private prisma: PrismaService) {}

  // Método auxiliar para manejar fechas correctamente - ACEPTA UNDEFINED
  private parseFecha(fechaString: string | Date | undefined): Date {
    if (!fechaString) return new Date();
    
    const fecha = typeof fechaString === 'string' 
      ? new Date(fechaString) 
      : fechaString;
    
    // Si la fecha viene sin hora (medianoche UTC), ajustar a mediodía en hora local
    if (fecha.getUTCHours() === 0 && fecha.getUTCMinutes() === 0 && fecha.getUTCSeconds() === 0) {
      // Establecer a mediodía en la zona horaria local
      fecha.setHours(12, 0, 0, 0);
    }
    
    return fecha;
  }

  async create(createKardexDto: CreateKardexDto) {
    // Manejar fecha correctamente - ahora acepta undefined
    const fecha = this.parseFecha(createKardexDto.fecha);

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
        fecha: fecha,
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
      orderBy: [
        { fecha: 'desc' },
        { id: 'desc' }  
      ],
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
      orderBy: [
        { fecha: 'desc' },
        { id: 'desc' }  
      ],
    });
  }

  async getSaldoActual(bodegaId: number, productoId: number): Promise<Decimal> {
    const ultimoMovimiento = await this.prisma.kardex.findFirst({
      where: {
        bodegaId,
        productoId,
      },
      orderBy: [
        { fecha: 'desc' },
        { id: 'desc' }  
      ],
    });

    return ultimoMovimiento ? ultimoMovimiento.saldoNuevo : new Decimal(0);
  }

  async update(id: number, updateKardexDto: UpdateKardexDto) {
    const movimientoExistente = await this.findOne(id);
    
    // Si cambia la cantidad, RECALCULAR saldos
    const necesitaRecalculo = 
      updateKardexDto.cantidad !== undefined && 
      updateKardexDto.cantidad !== movimientoExistente.cantidad.toNumber();

    // Manejar fecha en el update - también acepta undefined
    let fecha: Date | undefined;
    if (updateKardexDto.fecha !== undefined) {
      fecha = this.parseFecha(updateKardexDto.fecha);
    }

    if (necesitaRecalculo && updateKardexDto.cantidad !== undefined) {
      // Obtener el saldo anterior CORRECTO para este movimiento
      const saldoAnterior = await this.getSaldoAnterior(
        updateKardexDto.bodegaId || movimientoExistente.bodegaId,
        updateKardexDto.productoId || movimientoExistente.productoId,
        fecha || movimientoExistente.fecha,
        id // Excluir este movimiento de la búsqueda
      );

      // Obtener el tipo de movimiento
      const tipoMovimientoId = updateKardexDto.tipoMovimientoId || movimientoExistente.tipoMovimientoId;
      const tipoMovimiento = await this.prisma.tipoMovimiento.findUnique({
        where: { id: tipoMovimientoId },
      });

      if (!tipoMovimiento) {
        throw new NotFoundException('Tipo de movimiento no encontrado');
      }

      // Calcular nuevo saldo
      let nuevoSaldo: Decimal;
      const cantidad = new Decimal(updateKardexDto.cantidad);

      if (tipoMovimiento.tipo === 'ENTRADA') {
        nuevoSaldo = saldoAnterior.add(cantidad);
      } else {
        nuevoSaldo = saldoAnterior.sub(cantidad);
        if (nuevoSaldo.isNegative()) {
          throw new BadRequestException('Saldo insuficiente para realizar la salida');
        }
      }

      // Actualizar con saldos recalculados
      return this.prisma.kardex.update({
        where: { id },
        data: {
          ...updateKardexDto,
          fecha: fecha,
          cantidad: cantidad,
          saldoAnterior: saldoAnterior,
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

    // Si no necesita recálculo, actualizar normalmente
    return this.prisma.kardex.update({
      where: { id },
      data: {
        ...updateKardexDto,
        fecha: fecha,
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

  // Método para obtener el saldo anterior CORREGIDO
  private async getSaldoAnterior(
    bodegaId: number, 
    productoId: number, 
    fecha: Date, 
    excludeId?: number
  ): Promise<Decimal> {
    const whereClause: any = {
      bodegaId,
      productoId,
      fecha: { lt: fecha }
    };

    // Excluir el movimiento actual si se proporciona un ID
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const movimientoAnterior = await this.prisma.kardex.findFirst({
      where: whereClause,
      orderBy: [
        { fecha: 'desc' },
        { id: 'desc' }
      ],
    });

    return movimientoAnterior ? movimientoAnterior.saldoNuevo : new Decimal(0);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.kardex.delete({
      where: { id },
    });
  }
}