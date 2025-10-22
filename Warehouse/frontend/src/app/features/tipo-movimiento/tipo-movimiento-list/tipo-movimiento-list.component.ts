import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TipoMovimientoService, TipoMovimiento } from '../../../core/services/tipo-movimiento.service';

@Component({
  selector: 'app-tipo-movimiento-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tipo-movimiento-list.component.html',
  styleUrls: ['./tipo-movimiento-list.component.scss']
})
export class TipoMovimientoListComponent implements OnInit {
  tiposMovimiento: TipoMovimiento[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private tipoMovimientoService: TipoMovimientoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTiposMovimiento();
  }

  loadTiposMovimiento(): void {
    this.loading = true;
    this.tipoMovimientoService.getAll().subscribe({
      next: (data) => {
        this.tiposMovimiento = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar tipos de movimiento';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/tipos-movimiento/nuevo']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/tipos-movimiento', id, 'edit']);
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de eliminar este tipo de movimiento?')) {
      this.tipoMovimientoService.delete(id).subscribe({
        next: () => {
          this.loadTiposMovimiento();
        },
        error: (err) => {
          this.error = 'Error al eliminar tipo de movimiento';
          console.error(err);
        }
      });
    }
  }

  getTipoClass(tipo: string): string {
    return tipo === 'ENTRADA' ? 'badge-success' : 'badge-danger';
  }
}