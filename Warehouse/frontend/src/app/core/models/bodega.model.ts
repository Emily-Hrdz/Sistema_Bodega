export interface Bodega {
  id: number;
  nombre: string;
  ubicacion?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBodegaDto {
  nombre: string;
  ubicacion?: string;
  activo?: boolean;
}