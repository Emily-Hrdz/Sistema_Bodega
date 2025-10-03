import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BodegaService } from '../../../core/services/bodega.service';
import { Bodega } from '../../../core/models/bodega.model';

@Component({
  selector: 'app-bodegas-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bodegas-list.component.html',
  styleUrls: ['./bodegas-list.component.scss']
})
export class BodegasListComponent implements OnInit {
  bodegas: Bodega[] = [];
  loading = false;
  error: string | null = null;

  constructor(private bodegaService: BodegaService) {}

  ngOnInit(): void {
    this.loadBodegas();
  }

  loadBodegas(): void {
    this.loading = true;
    this.bodegaService.getAll().subscribe({
      next: (data) => {
        this.bodegas = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar bodegas';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteBodega(id: number): void {
    if (confirm('¿Está seguro de eliminar esta bodega?')) {
      this.bodegaService.delete(id).subscribe({
        next: () => {
          this.loadBodegas();
        },
        error: (err) => {
          this.error = 'Error al eliminar bodega';
          console.error(err);
        }
      });
    }
  }
}