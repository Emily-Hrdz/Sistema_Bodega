import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService, Cliente } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss']
})
export class ClienteFormComponent implements OnInit {
  clienteForm: FormGroup;
  isEdit = false;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.clienteForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      telefono: ['', [Validators.maxLength(20)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.loadCliente(Number(id));
    }
  }

  loadCliente(id: number): void {
    this.loading = true;
    this.clienteService.getById(id).subscribe({
      next: (cliente) => {
        this.clienteForm.patchValue(cliente);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar cliente';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      return;
    }

    this.loading = true;
    const clienteData = this.clienteForm.value;

    if (this.isEdit) {
      const id = this.route.snapshot.params['id'];
      this.clienteService.update(Number(id), clienteData).subscribe({
        next: () => {
          this.router.navigate(['/clientes']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar cliente';
          this.loading = false;
        }
      });
    } else {
      this.clienteService.create(clienteData).subscribe({
        next: () => {
          this.router.navigate(['/clientes']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear cliente';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/clientes']);
  }
}