import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BodegaService } from '../../../core/services/bodega.service';

@Component({
  selector: 'app-bodega-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bodega-form.component.html',
  styleUrls: ['./bodega-form.component.scss']
})
export class BodegaFormComponent implements OnInit {
  bodegaForm: FormGroup;
  isEditMode = false;
  bodegaId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bodegaService: BodegaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.bodegaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      ubicacion: ['', Validators.maxLength(200)],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.bodegaId = +id;
      this.loadBodega(this.bodegaId);
    }
  }

  loadBodega(id: number): void {
    this.loading = true;
    this.bodegaService.getById(id).subscribe({
      next: (bodega) => {
        this.bodegaForm.patchValue(bodega);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar bodega';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.bodegaForm.invalid) {
      return;
    }

    this.loading = true;
    const bodegaData = this.bodegaForm.value;

    const request = this.isEditMode && this.bodegaId
      ? this.bodegaService.update(this.bodegaId, bodegaData)
      : this.bodegaService.create(bodegaData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/bodegas/list']);
      },
      error: (err) => {
        this.error = 'Error al guardar bodega';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/bodegas/list']);
  }
}