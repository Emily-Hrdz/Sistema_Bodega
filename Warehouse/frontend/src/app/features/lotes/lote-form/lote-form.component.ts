import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoteService, Lote } from '../../../core/services/lote.service';

@Component({
  selector: 'app-lote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lote-form.component.html',
  styleUrls: ['./lote-form.component.scss']
})
export class LoteFormComponent implements OnInit {
  loteForm: FormGroup;
  isEdit = false;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private loteService: LoteService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loteForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      fechaVencimiento: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.loadLote(Number(id));
    }
  }

  loadLote(id: number): void {
    this.loading = true;
    this.loteService.getById(id).subscribe({
      next: (lote) => {
        const fechaVencimiento = lote.fechaVencimiento 
          ? new Date(lote.fechaVencimiento).toISOString().split('T')[0]
          : '';
        
        this.loteForm.patchValue({
          ...lote,
          fechaVencimiento
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar lote';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.loteForm.invalid) {
      return;
    }

    this.loading = true;
    const loteData = this.loteForm.value;

    if (this.isEdit) {
      const id = this.route.snapshot.params['id'];
      this.loteService.update(Number(id), loteData).subscribe({
        next: () => {
          this.router.navigate(['/lotes']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar lote';
          this.loading = false;
        }
      });
    } else {
      this.loteService.create(loteData).subscribe({
        next: () => {
          this.router.navigate(['/lotes']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear lote';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/lotes']);
  }
}