import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClienteService, Cliente } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent implements OnInit {
  clientes: Cliente[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
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

  onDelete(id: number): void {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.clienteService.delete(id).subscribe({
        next: () => {
          this.loadClientes();
        },
        error: (err) => {
          this.error = 'Error al eliminar cliente';
          console.error(err);
        }
      });
    }
  }
}