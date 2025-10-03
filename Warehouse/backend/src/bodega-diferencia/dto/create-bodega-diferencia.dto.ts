import { IsInt, IsNumber, IsDateString, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBodegaDiferenciaDto {
  @IsInt()
  bodegaId: number;

  @IsInt()
  productoId: number;

  @IsNumber()
  cantidadSistema: number;

  @IsNumber()
  cantidadFisica: number;

  @IsDateString()
  fechaConteo: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsBoolean()
  @IsOptional()
  ajustado?: boolean;
}