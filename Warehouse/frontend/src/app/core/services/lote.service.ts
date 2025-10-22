import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Lote {
  id: number;
  codigo: string;
  fechaVencimiento?: Date;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private apiUrl = `${environment.apiUrl}/lotes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Lote[]> {
    return this.http.get<Lote[]>(this.apiUrl);
  }

  getById(id: number): Observable<Lote> {
    return this.http.get<Lote>(`${this.apiUrl}/${id}`);
  }

  create(lote: Partial<Lote>): Observable<Lote> {
    return this.http.post<Lote>(this.apiUrl, lote);
  }

  update(id: number, lote: Partial<Lote>): Observable<Lote> {
  return this.http.patch<Lote>(`${this.apiUrl}/${id}`, lote);
 }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}