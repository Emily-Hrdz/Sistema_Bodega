import { ViewChild as DialogViewChild } from '@angular/core';
import { DeleteDialogComponent } from '../../../shared/delete-dialog.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoteService, Lote } from '../../../core/services/lote.service';

@Component({
  selector: 'app-lotes-list',
  standalone: true,
  imports: [DeleteDialogComponent, CommonModule],
  templateUrl: './lotes-list.component.html',
  styleUrls: ['./lotes-list.component.scss']
})
export class LotesListComponent implements OnInit {
  lotes: Lote[] = [];
  loading = false;
  @DialogViewChild(DeleteDialogComponent, { static: true }) deleteDialog!: DeleteDialogComponent;
  deletingId: number | null = null;
  error: string | null = null;

  constructor(
    private loteService: LoteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLotes();
  }

  loadLotes(): void {
    this.error = '';
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

  async onDelete(id: number): Promise<void> {
    if (this.deletingId !== null) return;
    const record = this.lotes.find(item => item.id === id);
    if (!record) return;
    if (!await this.deleteDialog.open(record.codigo)) return;
    this.deletingId = id;
    this.error = '';
    this.loteService.delete(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadLotes();
      },
      error: (err) => {
        this.deletingId = null;
        this.error = err.error?.message || 'No se pudo eliminar el lote. Inténtelo nuevamente.';
      }
    });
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }
}
