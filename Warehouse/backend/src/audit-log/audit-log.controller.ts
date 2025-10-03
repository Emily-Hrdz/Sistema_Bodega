import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(@Query('limit', ParseIntPipe) limit?: number) {
    return this.auditLogService.findAll(limit);
  }

  @Get('user/:userId')
  findByUser(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.auditLogService.findByUser(userId, limit);
  }

  @Get('entity')
  findByEntity(
    @Query('entidad') entidad: string,
    @Query('entidadId', ParseIntPipe) entidadId: number,
  ) {
    return this.auditLogService.findByEntity(entidad, entidadId);
  }
}