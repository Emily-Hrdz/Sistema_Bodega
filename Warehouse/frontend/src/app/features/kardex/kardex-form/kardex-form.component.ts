import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KardexService } from '../../../core/services/kardex.service';
import { BodegaService } from '../../../core/services/bodega.service';
import { ProductoService } from '../../../core/services/producto.service';
import { TipoMovimientoService } from '../../../core/services/tipo-movimiento.service';
import { Bodega } from '../../../core/models/bodega.model';
import { Producto } from '../../../core/models/producto.model';
import { TipoMovimiento } from '../../../core/services/tipo-movimiento.service';
import { CreateKardexDto } from '../../../core/models/kardex.model';

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
  isEdit = false; 

  constructor(
    private fb: FormBuilder,
    private kardexService: KardexService,
    private bodegaService: BodegaService,
    private productoService: ProductoService,
    private tipoMovimientoService: TipoMovimientoService,
    private route: ActivatedRoute, 
    private router: Router
  ) {
    this.kardexForm = this.fb.group({
      bodegaId: ['', Validators.required],
      productoId: ['', Validators.required],
      tipoMovimientoId: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0.001)]],
      fecha: [this.getCurrentDateFormatted()],
      observaciones: ['']
    });
  }

  // Método para obtener la fecha actual formateada correctamente
  private getCurrentDateFormatted(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // Método para convertir string a Date con hora mediodía
  private convertToDate(dateString: string): Date {
    if (!dateString) return new Date();
    
    const date = new Date(dateString);
    // Establecer a mediodía para evitar problemas de zona horaria
    date.setHours(12, 0, 0, 0);
    return date;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.loadKardex(Number(id));
    } else {
      this.loadCatalogos();
    }
  }

  loadKardex(id: number): void {
    this.loading = true;
    this.kardexService.getById(id).subscribe({
      next: (kardex) => {
        // Convertir fecha al formato correcto para el input
        const fecha = new Date(kardex.fecha);
        const fechaFormatted = fecha.toISOString().split('T')[0];
        
        this.kardexForm.patchValue({
          bodegaId: kardex.bodegaId,
          productoId: kardex.productoId,
          tipoMovimientoId: kardex.tipoMovimientoId,
          cantidad: kardex.cantidad,
          fecha: fechaFormatted,
          observaciones: kardex.observaciones
        });
        this.loadCatalogos();
      },
      error: (err) => {
        this.error = 'Error al cargar movimiento';
        this.loading = false;
        console.error(err);
      }
    });
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
        
        if (data.length === 0) {
          this.error = 'No hay tipos de movimiento configurados. Crea algunos primero.';
        }
      },
      error: (err) => {
        console.error('Error loading tipos movimiento:', err);
        this.error = 'Error al cargar tipos de movimiento. Verifica la conexión.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.kardexForm.invalid) {
      return;
    }

    this.loading = true;
    
    const kardexData: CreateKardexDto = {
      bodegaId: Number(this.kardexForm.value.bodegaId),
      productoId: Number(this.kardexForm.value.productoId),
      tipoMovimientoId: Number(this.kardexForm.value.tipoMovimientoId),
      cantidad: Number(this.kardexForm.value.cantidad),
      fecha: this.convertToDate(this.kardexForm.value.fecha), 
      observaciones: this.kardexForm.value.observaciones
    };

    if (this.isEdit) {
      const id = this.route.snapshot.params['id'];
      this.kardexService.update(Number(id), kardexData).subscribe({
        next: () => {
          this.router.navigate(['/kardex/list']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar movimiento';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
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
  }

  onCancel(): void {
    this.router.navigate(['/kardex/list']);
  }
}