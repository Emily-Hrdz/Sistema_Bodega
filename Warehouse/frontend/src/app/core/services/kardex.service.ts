import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Kardex, CreateKardexDto } from '../models/kardex.model';

@Injectable({
  providedIn: 'root'
})
export class KardexService {
  private apiUrl = `${environment.apiUrl}/kardex`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Kardex[]> {
    return this.http.get<Kardex[]>(this.apiUrl);
  }

  getById(id: number): Observable<Kardex> {
    return this.http.get<Kardex>(`${this.apiUrl}/${id}`);
  }

  getByBodegaProducto(bodegaId: number, productoId: number): Observable<Kardex[]> {
    const params = new HttpParams()
      .set('bodegaId', bodegaId.toString())
      .set('productoId', productoId.toString());
    return this.http.get<Kardex[]>(`${this.apiUrl}/bodega-producto`, { params });
  }

  getSaldo(bodegaId: number, productoId: number): Observable<number> {
    const params = new HttpParams()
      .set('bodegaId', bodegaId.toString())
      .set('productoId', productoId.toString());
    return this.http.get<number>(`${this.apiUrl}/saldo`, { params });
  }

  create(kardex: CreateKardexDto): Observable<Kardex> {
    return this.http.post<Kardex>(this.apiUrl, kardex);
  }

  update(id: number, kardex: Partial<CreateKardexDto>): Observable<Kardex> {
    return this.http.patch<Kardex>(`${this.apiUrl}/${id}`, kardex);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}