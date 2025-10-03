import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TipoProducto {
  id: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TipoProductoService {
  private apiUrl = `${environment.apiUrl}/tipos-productos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TipoProducto[]> {
    return this.http.get<TipoProducto[]>(this.apiUrl);
  }

  getById(id: number): Observable<TipoProducto> {
    return this.http.get<TipoProducto>(`${this.apiUrl}/${id}`);
  }

  create(tipoProducto: Partial<TipoProducto>): Observable<TipoProducto> {
    return this.http.post<TipoProducto>(this.apiUrl, tipoProducto);
  }

  update(id: number, tipoProducto: Partial<TipoProducto>): Observable<TipoProducto> {
    return this.http.patch<TipoProducto>(`${this.apiUrl}/${id}`, tipoProducto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}