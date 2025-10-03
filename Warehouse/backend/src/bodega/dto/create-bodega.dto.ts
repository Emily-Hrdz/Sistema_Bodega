import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateBodegaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  ubicacion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}