import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateTipoProductoDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}