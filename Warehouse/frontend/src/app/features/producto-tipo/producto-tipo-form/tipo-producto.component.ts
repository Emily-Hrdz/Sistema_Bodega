import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TipoProductoService } from '../../../core/services/tipo-producto.service';   

@Component({
  selector: 'app-tipo-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tipo-producto-form.component.html',
  styleUrls: ['./tipo-producto-form.component.scss']
})
export class TipoProductoFormComponent implements OnInit {
  tipoProductoForm: FormGroup;
  isEditMode = false;
  tipoProductoId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private tipoProductoService: TipoProductoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tipoProductoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.tipoProductoId = +id;
      this.loadTipoProducto(this.tipoProductoId);
    }
  }

  loadTipoProducto(id: number): void {
    this.loading = true;
    this.tipoProductoService.getById(id).subscribe({
      next: (tipoProducto) => {
        this.tipoProductoForm.patchValue({
          nombre: tipoProducto.nombre,
          descripcion: tipoProducto.descripcion,
            activo: true
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el tipo de producto';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.tipoProductoForm.valid) {
      this.loading = true;
      const tipoProductoData = this.tipoProductoForm.value;

      const request = this.isEditMode && this.tipoProductoId
        ? this.tipoProductoService.update(this.tipoProductoId, tipoProductoData)
        : this.tipoProductoService.create(tipoProductoData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/productos/list']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al guardar el tipo de producto';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/productos/list']);
  }
}
