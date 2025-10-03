export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoProductoId: number;
  tipoProducto?: TipoProducto;
  unidadMedida: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TipoProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface CreateProductoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoProductoId: number;
  unidadMedida: string;
  activo?: boolean;
}