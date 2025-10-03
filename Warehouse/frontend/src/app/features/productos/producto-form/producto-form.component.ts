import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { TipoProductoService, TipoProducto } from '../../../core/services/tipo-producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.scss']
})
export class ProductoFormComponent implements OnInit {
  productoForm: FormGroup;
  tiposProducto: TipoProducto[] = [];
  isEditMode = false;
  productoId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private tipoProductoService: TipoProductoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: [''],
      tipoProductoId: [null, Validators.required], // <--- Inicializamos como null
      
      unidadMedida: ['', Validators.maxLength(20)]
    });
  }

  ngOnInit(): void {
    this.loadTiposProducto();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productoId = +id;
      this.loadProducto(this.productoId);
    }
  }

  loadTiposProducto(): void {
    this.tipoProductoService.getAll().subscribe({
      next: (data) => {
        this.tiposProducto = data;
      },
      error: (err) => {
        this.error = 'Error al cargar tipos de producto';
        console.error(err);
      }
    });
  }

  loadProducto(id: number): void {
    this.loading = true;
    this.productoService.getById(id).subscribe({
      next: (producto) => {
        this.productoForm.patchValue({
          codigo: producto.codigo,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          tipoProductoId: producto.tipoProductoId, // ya es número
          
          unidadMedida: producto.unidadMedida
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar producto';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.productoForm.valid) {
      this.loading = true;
      const productoData = {
        ...this.productoForm.value,
        tipoProductoId: Number(this.productoForm.value.tipoProductoId) // <--- convertir a número
      };

      const request = this.isEditMode && this.productoId
        ? this.productoService.update(this.productoId, productoData)
        : this.productoService.create(productoData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/productos/list']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al guardar producto';
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
