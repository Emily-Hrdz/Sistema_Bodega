import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TipoMovimiento {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'ENTRADA' | 'SALIDA';
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TipoMovimientoService {
  private apiUrl = `${environment.apiUrl}/tipos-movimiento`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TipoMovimiento[]> {
    return this.http.get<TipoMovimiento[]>(this.apiUrl);
  }

  getById(id: number): Observable<TipoMovimiento> {
    return this.http.get<TipoMovimiento>(`${this.apiUrl}/${id}`);
  }

  create(tipoMovimiento: Partial<TipoMovimiento>): Observable<TipoMovimiento> {
    return this.http.post<TipoMovimiento>(this.apiUrl, tipoMovimiento);
  }

  update(id: number, tipoMovimiento: Partial<TipoMovimiento>): Observable<TipoMovimiento> {
    return this.http.patch<TipoMovimiento>(`${this.apiUrl}/${id}`, tipoMovimiento);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}