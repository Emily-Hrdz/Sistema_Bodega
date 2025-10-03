import { IsString, IsEmail, MinLength, MaxLength, IsIn, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @IsIn(['ADMIN', 'OPERADOR', 'SUPERVISOR'])
  rol: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}