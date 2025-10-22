import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContainerService, Container } from '../../../core/services/container.service';

@Component({
  selector: 'app-containers-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './containers-list.component.html',
  styleUrls: ['./containers-list.component.scss']
})
export class ContainersListComponent implements OnInit {
  containers: Container[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private containerService: ContainerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContainers();
  }

  loadContainers(): void {
    this.loading = true;
    this.containerService.getAll().subscribe({
      next: (data) => {
        this.containers = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar containers';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/containers/nuevo']);
  }

  onView(id: number): void {
    this.router.navigate(['/containers', id]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/containers', id, 'edit']);
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de eliminar este container?')) {
      this.containerService.delete(id).subscribe({
        next: () => {
          this.loadContainers();
        },
        error: (err) => {
          this.error = 'Error al eliminar container';
          console.error(err);
        }
      });
    }
  }
}