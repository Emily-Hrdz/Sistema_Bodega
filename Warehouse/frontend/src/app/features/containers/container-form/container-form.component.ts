import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContainerService, Container } from '../../../core/services/container.service';

@Component({
  selector: 'app-container-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './container-form.component.html',
  styleUrls: ['./container-form.component.scss']
})
export class ContainerFormComponent implements OnInit {
  containerForm: FormGroup;
  isEdit = false;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private containerService: ContainerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.containerForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.loadContainer(Number(id));
    }
  }

  loadContainer(id: number): void {
    this.loading = true;
    this.containerService.getById(id).subscribe({
      next: (container) => {
        this.containerForm.patchValue(container);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar container';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.containerForm.invalid) {
      return;
    }

    this.loading = true;
    const containerData = this.containerForm.value;

    if (this.isEdit) {
      const id = this.route.snapshot.params['id'];
      this.containerService.update(Number(id), containerData).subscribe({
        next: () => {
          this.router.navigate(['/containers']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar container';
          this.loading = false;
        }
      });
    } else {
      this.containerService.create(containerData).subscribe({
        next: () => {
          this.router.navigate(['/containers']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear container';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/containers']);
  }
}