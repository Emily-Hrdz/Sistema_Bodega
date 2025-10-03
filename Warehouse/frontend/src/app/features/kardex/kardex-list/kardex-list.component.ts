import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KardexService } from '../../../core/services/kardex.service';
import { Kardex } from '../../../core/models/kardex.model';

@Component({
  selector: 'app-kardex-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './kardex-list.component.html',
  styleUrls: ['./kardex-list.component.scss']
})
export class KardexListComponent implements OnInit {
  movimientos: Kardex[] = [];
  loading = false;
  error: string | null = null;

  constructor(private kardexService: KardexService) {}

  ngOnInit(): void {
    this.loadMovimientos();
  }

  loadMovimientos(): void {
    this.loading = true;
    this.kardexService.getAll().subscribe({
      next: (data) => {
        this.movimientos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar movimientos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteMovimiento(id: number): void {
    if (confirm('¿Está seguro de eliminar este movimiento?')) {
      this.kardexService.delete(id).subscribe({
        next: () => {
          this.loadMovimientos();
        },
        error: (err) => {
          this.error = 'Error al eliminar movimiento';
          console.error(err);
        }
      });
    }
  }
}