import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  getAll(limit: number = 100): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl, {
      params: { limit: limit.toString() }
    }).pipe(
      catchError(error => {
        console.error('Error cargando auditoría:', error);
       
        return this.http.get<AuditLog[]>(this.apiUrl);
      })
    );
  }

  getAllSimple(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl);
  }
}