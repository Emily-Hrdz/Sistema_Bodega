import { Bodega } from "./bodega.model";
import { Producto } from "./producto.model";

export interface Kardex {
  id: number;
  bodegaId: number;
  bodega?: Bodega;
  productoId: number;
  producto?: Producto;
  containerId?: number;
  container?: Container;
  loteId?: number;
  lote?: Lote;
  clienteId?: number;
  cliente?: Cliente;
  tipoMovimientoId: number;
  tipoMovimiento?: TipoMovimiento;
  fecha: Date;
  cantidad: number;
  saldoAnterior: number;
  saldoNuevo: number;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateKardexDto {
  bodegaId: number;
  productoId: number;
  tipoMovimientoId: number;
  cantidad: number;
  fecha: Date;
  observaciones?: string;
  containerId?: number;
  loteId?: number;
  clienteId?: number;
}

export interface TipoMovimiento {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'ENTRADA' | 'SALIDA';
  activo: boolean;
}

export interface Container {
  id: number;
  codigo: string;
  descripcion?: string;
  activo: boolean;
}

export interface Lote {
  id: number;
  codigo: string;
  fechaVencimiento?: Date;
  activo: boolean;
}

export interface Cliente {
  id: number;
  codigo: string;
  nombre: string;
  email?: string;
  telefono?: string;
  activo: boolean;
}