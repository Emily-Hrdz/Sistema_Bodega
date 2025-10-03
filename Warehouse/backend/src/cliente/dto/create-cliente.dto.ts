import { IsString, IsOptional, IsBoolean, IsEmail, MaxLength } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}