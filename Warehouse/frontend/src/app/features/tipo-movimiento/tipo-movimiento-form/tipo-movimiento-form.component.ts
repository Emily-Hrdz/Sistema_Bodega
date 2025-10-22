import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoMovimientoService, TipoMovimiento } from '../../../core/services/tipo-movimiento.service';

@Component({
  selector: 'app-tipo-movimiento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tipo-movimiento-form.component.html',
  styleUrls: ['./tipo-movimiento-form.component.scss']
})
export class TipoMovimientoFormComponent implements OnInit {
  tipoMovimientoForm: FormGroup;
  isEdit = false;
  loading = false;
  error: string | null = null;

  tipos = [
    { value: 'ENTRADA', label: 'Entrada' },
    { value: 'SALIDA', label: 'Salida' }
  ];

  constructor(
    private fb: FormBuilder,
    private tipoMovimientoService: TipoMovimientoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.tipoMovimientoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['', Validators.required],
      descripcion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.loadTipoMovimiento(Number(id));
    }
  }

  loadTipoMovimiento(id: number): void {
    this.loading = true;
    this.tipoMovimientoService.getById(id).subscribe({
      next: (tipo) => {
        this.tipoMovimientoForm.patchValue(tipo);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar tipo de movimiento';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.tipoMovimientoForm.invalid) {
      return;
    }

    this.loading = true;
    const tipoData = this.tipoMovimientoForm.value;

    if (this.isEdit) {
      const id = this.route.snapshot.params['id'];
      this.tipoMovimientoService.update(Number(id), tipoData).subscribe({
        next: () => {
          this.router.navigate(['/kardex/nuevo']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar tipo de movimiento';
          this.loading = false;
        }
      });
    } else {
      this.tipoMovimientoService.create(tipoData).subscribe({
        next: () => {
          this.router.navigate(['/kardex/nuevo']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear tipo de movimiento';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/kardex/nuevo']);
  }
}