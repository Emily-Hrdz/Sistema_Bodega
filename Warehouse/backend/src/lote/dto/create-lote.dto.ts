import { IsString, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';

export class CreateLoteDto {
  @IsString()
  @MaxLength(50)
  codigo: string;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}