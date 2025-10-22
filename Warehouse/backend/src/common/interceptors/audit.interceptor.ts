import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../audit-log/audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers, params, body } = request;
    const userAgent = headers['user-agent'];

    // Solo auditar si hay usuario autenticado
    if (!user || !user.id) {
      return next.handle();
    }

    const userId = user.id;

    const accionMap: any = {
      POST: 'CREATE',
      PATCH: 'UPDATE', 
      PUT: 'UPDATE',
      DELETE: 'DELETE',
      GET: 'READ',
    };

    const accion = accionMap[method] || method;
    const entidad = this.extractEntityFromUrl(url);

    // Ignorar rutas específicas
    if (this.shouldIgnoreUrl(url)) {
      return next.handle();
    }

    // Obtener entidadId de forma segura
    let entidadId: number | undefined = undefined;
    if (params && params.id) {
      entidadId = parseInt(params.id, 10);
    } else if (body && body.id) {
      entidadId = parseInt(body.id, 10);
    }
    
    return next.handle().pipe(
      tap((data) => {
      
        if (data === undefined || data === null) {
          this.createAuditLog(userId, accion, entidad, entidadId, ip, userAgent);
          return;
        }

        if (Array.isArray(data)) {
          this.createAuditLog(userId, accion, entidad, undefined, ip, userAgent);
          return;
        }

        const dataId = (data as any)?.id;
        const finalEntidadId = dataId ? parseInt(dataId, 10) : entidadId;
        
        this.createAuditLog(userId, accion, entidad, finalEntidadId, ip, userAgent);
      }),
    );
  }

  private createAuditLog(
    userId: number, 
    accion: string, 
    entidad: string, 
    entidadId: number | undefined, 
    ip: string, 
    userAgent: string
  ): void {
    try {
      this.auditLogService.create({
        userId,
        accion,
        entidad,
        entidadId,
        descripcion: `${accion} en ${entidad}${entidadId ? ` #${entidadId}` : ''}`,
        ipAddress: ip,
        userAgent,
      }).catch(() => {
       
      });
    } catch (error) {
      
    }
  }

  private extractEntityFromUrl(url: string): string {
    try {
      const cleanUrl = url.split('?')[0];
      const parts = cleanUrl.split('/').filter(part => part);
      
      const apiIndex = parts.indexOf('api');
      if (apiIndex !== -1 && parts.length > apiIndex + 1) {
        const entity = parts[apiIndex + 1].toUpperCase().replace(/-/g, '_');
        return entity;
      }
      return 'UNKNOWN';
    } catch {
      return 'UNKNOWN';
    }
  }

  private shouldIgnoreUrl(url: string): boolean {
    try {
      const ignoredPatterns = [
        '/auth/',
        '/audit-logs',
        '/health',
        '/metrics'
      ];
      return ignoredPatterns.some(pattern => url.includes(pattern));
    } catch {
      return false;
    }
  }
}