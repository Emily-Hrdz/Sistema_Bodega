import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bodega, CreateBodegaDto } from '../models/bodega.model';

@Injectable({
  providedIn: 'root'
})
export class BodegaService {
  private apiUrl = `${environment.apiUrl}/bodegas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bodega[]> {
    return this.http.get<Bodega[]>(this.apiUrl);
  }

  getById(id: number): Observable<Bodega> {
    return this.http.get<Bodega>(`${this.apiUrl}/${id}`);
  }

  create(bodega: CreateBodegaDto): Observable<Bodega> {
    return this.http.post<Bodega>(this.apiUrl, bodega);
  }

  update(id: number, bodega: Partial<CreateBodegaDto>): Observable<Bodega> {
    return this.http.patch<Bodega>(`${this.apiUrl}/${id}`, bodega);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}