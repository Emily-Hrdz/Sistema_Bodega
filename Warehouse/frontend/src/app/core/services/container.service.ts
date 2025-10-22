import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Container {
  id: number;
  codigo: string;
  descripcion?: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContainerService {
  private apiUrl = `${environment.apiUrl}/containers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Container[]> {
    return this.http.get<Container[]>(this.apiUrl);
  }

  getById(id: number): Observable<Container> {
    return this.http.get<Container>(`${this.apiUrl}/${id}`);
  }

  create(container: Partial<Container>): Observable<Container> {
    return this.http.post<Container>(this.apiUrl, container);
  }

  update(id: number, container: Partial<Container>): Observable<Container> {
    return this.http.patch<Container>(`${this.apiUrl}/${id}`, container);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}