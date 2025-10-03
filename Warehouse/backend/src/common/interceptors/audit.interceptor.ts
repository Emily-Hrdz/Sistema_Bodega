import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './../../audit-log/audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;
    const userAgent = headers['user-agent'];

    // Solo auditar si hay usuario autenticado
    if (!user) {
      return next.handle();
    }

    const accionMap = {
      POST: 'CREATE',
      PATCH: 'UPDATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
      GET: 'READ',
    };

    const accion = accionMap[method] || method;
    const entidad = this.extractEntityFromUrl(url);

    return next.handle().pipe(
      tap((data) => {
        // Registrar en auditoría después de la operación exitosa
        this.auditLogService.create({
          userId: user.userId,
          accion,
          entidad,
          entidadId: data?.id || null,
          descripcion: `${accion} en ${entidad}: ${url}`,
          ipAddress: ip,
          userAgent,
        }).catch(err => console.error('Error al registrar auditoría:', err));
      }),
    );
  }

  private extractEntityFromUrl(url: string): string {
    const parts = url.split('/');
    const apiIndex = parts.indexOf('api');
    if (apiIndex !== -1 && parts.length > apiIndex + 1) {
      return parts[apiIndex + 1].toUpperCase();
    }
    return 'UNKNOWN';
  }
}