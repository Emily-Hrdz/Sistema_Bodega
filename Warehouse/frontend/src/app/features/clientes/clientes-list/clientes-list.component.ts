import { ViewChild as DialogViewChild } from '@angular/core';
import { DeleteDialogComponent } from '../../../shared/delete-dialog.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClienteService, Cliente } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [DeleteDialogComponent, CommonModule],
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent implements OnInit {
  clientes: Cliente[] = [];
  loading = false;
  @DialogViewChild(DeleteDialogComponent, { static: true }) deleteDialog!: DeleteDialogComponent;
  deletingId: number | null = null;
  error: string | null = null;

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.error = '';
    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar clientes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/clientes/nuevo']);
  }

  onView(id: number): void {
    this.router.navigate(['/clientes', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/clientes', id, 'edit']);
  }

  async onDelete(id: number): Promise<void> {
    if (this.deletingId !== null) return;
    const record = this.clientes.find(item => item.id === id);
    if (!record) return;
    if (!await this.deleteDialog.open(record.nombre)) return;
    this.deletingId = id;
    this.error = '';
    this.clienteService.delete(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadClientes();
      },
      error: (err) => {
        this.deletingId = null;
        this.error = err.error?.message || 'No se pudo eliminar el cliente. Inténtelo nuevamente.';
      }
    });
  }
}
