import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditLog {
  id: number;
  userId: number;
  user: {
    id: number;
    email: string;
    nombre: string;
    rol: string;
  };
  accion: string;
  entidad: string;
  entidadId?: number;
  descripcion: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  // CORREGIDO - El endpoint correcto según tu backend
  getAll(limit: number = 100): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl, {
      params: { limit: limit.toString() }
    });
  }

  getByUser(userId: number, limit: number = 50): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/user/${userId}`, {
      params: { limit: limit.toString() }
    });
  }

  getByEntity(entidad: string, entidadId: number): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/entity/${entidad}/${entidadId}`);
  }
}