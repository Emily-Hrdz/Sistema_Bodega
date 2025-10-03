import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateContainerDto {
  @IsString()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}