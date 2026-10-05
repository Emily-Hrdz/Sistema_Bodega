import {
  Controller,
  Get,
  Query,
  Param,
  DefaultValuePipe,
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
  findAll(@Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number) {
    return this.auditLogService.findAll(Math.max(1, Math.min(limit, 200)));
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.auditLogService.findByUser(userId, Math.max(1, Math.min(limit, 200)));
  }

  @Get('entity')
  findByEntity(
    @Query('entidad') entidad: string,
    @Query('entidadId', ParseIntPipe) entidadId: number,
  ) {
    return this.auditLogService.findByEntity(entidad, entidadId);
  }
}
