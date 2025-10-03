import { IsString, IsInt, IsOptional, MaxLength } from 'class-validator';

export class CreateAuditLogDto {
  @IsInt()
  userId: number;

  @IsString()
  @MaxLength(100)
  accion: string;

  @IsString()
  @MaxLength(100)
  entidad: string;

  @IsInt()
  @IsOptional()
  entidadId?: number;

  @IsString()
  descripcion: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}