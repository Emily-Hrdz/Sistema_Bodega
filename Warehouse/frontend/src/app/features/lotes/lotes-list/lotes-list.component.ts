import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoteService, Lote } from '../../../core/services/lote.service';

@Component({
  selector: 'app-lotes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lotes-list.component.html',
  styleUrls: ['./lotes-list.component.scss']
})
export class LotesListComponent implements OnInit {
  lotes: Lote[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private loteService: LoteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLotes();
  }

  loadLotes(): void {
    this.loading = true;
    this.loteService.getAll().subscribe({
      next: (data) => {
        this.lotes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar lotes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/lotes/nuevo']);
  }

  onView(id: number): void {
    this.router.navigate(['/lotes', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/lotes', id, 'edit']);
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de eliminar este lote?')) {
      this.loteService.delete(id).subscribe({
        next: () => {
          this.loadLotes();
        },
        error: (err) => {
          this.error = 'Error al eliminar lote';
          console.error(err);
        }
      });
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }
}