import { IsString, IsOptional, IsBoolean, IsIn, MaxLength } from 'class-validator';

export class CreateTipoMovimientoDto {
  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsIn(['ENTRADA', 'SALIDA'])
  tipo: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}