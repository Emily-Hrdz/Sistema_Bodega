import { IsString, IsInt, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  tipoProductoId: number;

  @IsString()
  @MaxLength(20)
  unidadMedida: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}