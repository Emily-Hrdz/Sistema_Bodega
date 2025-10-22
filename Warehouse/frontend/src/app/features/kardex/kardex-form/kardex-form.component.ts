// features/kardex/kardex-form/kardex-form.component.ts - CORREGIDO
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KardexService } from '../../../core/services/kardex.service';
import { BodegaService } from '../../../core/services/bodega.service';
import { ProductoService } from '../../../core/services/producto.service';
import { TipoMovimientoService } from '../../../core/services/tipo-movimiento.service';
import { Bodega } from '../../../core/models/bodega.model';
import { Producto } from '../../../core/models/producto.model';
import { TipoMovimiento } from '../../../core/services/tipo-movimiento.service';

@Component({
  selector: 'app-kardex-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './kardex-form.component.html',
  styleUrls: ['./kardex-form.component.scss']
})
export class KardexFormComponent implements OnInit {
  kardexForm: FormGroup;
  bodegas: Bodega[] = [];
  productos: Producto[] = [];
  tiposMovimiento: TipoMovimiento[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private kardexService: KardexService,
    private bodegaService: BodegaService,
    private productoService: ProductoService,
    private tipoMovimientoService: TipoMovimientoService,
    private router: Router
  ) {
    this.kardexForm = this.fb.group({
      bodegaId: ['', Validators.required],
      productoId: ['', Validators.required],
      tipoMovimientoId: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0.001)]],
      fecha: [new Date().toISOString().split('T')[0]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.loadCatalogos();
  }

  loadCatalogos(): void {
    this.loading = true;
    
    this.bodegaService.getAll().subscribe({
      next: (data) => this.bodegas = data,
      error: (err) => console.error('Error loading bodegas:', err)
    });

    this.productoService.getAll().subscribe({
      next: (data) => this.productos = data,
      error: (err) => console.error('Error loading productos:', err)
    });

    this.tipoMovimientoService.getAll().subscribe({
      next: (data) => {
        this.tiposMovimiento = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tipos movimiento:', err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.kardexForm.invalid) {
      return;
    }

    this.loading = true;
    const kardexData = this.kardexForm.value;

    this.kardexService.create(kardexData).subscribe({
      next: () => {
        this.router.navigate(['/kardex/list']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al crear movimiento';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/kardex/list']);
  }
}