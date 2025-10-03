import { IsInt, IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';

export class CreateKardexDto {
  @IsInt()
  bodegaId: number;

  @IsInt()
  productoId: number;

  @IsInt()
  @IsOptional()
  containerId?: number;

  @IsInt()
  @IsOptional()
  loteId?: number;

  @IsInt()
  @IsOptional()
  clienteId?: number;

  @IsInt()
  tipoMovimientoId: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsNumber()
  cantidad: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}