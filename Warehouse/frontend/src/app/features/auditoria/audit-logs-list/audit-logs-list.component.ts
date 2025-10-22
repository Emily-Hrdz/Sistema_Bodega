import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService, AuditLog } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-logs-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-logs-list.component.html',
  styleUrls: ['./audit-logs-list.component.scss']
})
export class AuditLogsListComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  loading = false;
  error: string | null = null;

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading = true;
    this.error = null;
    
    this.auditLogService.getAll(100).subscribe({
      next: (data) => {
        this.auditLogs = data;
        this.loading = false;
        console.log('Auditoría cargada:', data); // Para debug
      },
      error: (err) => {
        console.error('Error detallado:', err);
        this.error = `Error al cargar auditoría: ${err.status} ${err.statusText}`;
        this.loading = false;
        
        // Intenta cargar sin parámetros
        this.loadAuditLogsSimple();
      }
    });
  }

  loadAuditLogsSimple(): void {
    this.auditLogService.getAllSimple().subscribe({
      next: (data) => {
        this.auditLogs = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la auditoría. Verifica que el endpoint exista.';
        this.loading = false;
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-ES');
  }

  getActionClass(accion: string): string {
    switch (accion.toUpperCase()) {
      case 'CREATE':
        return 'badge-success';
      case 'UPDATE':
        return 'badge-warning';
      case 'DELETE':
        return 'badge-danger';
      case 'LOGIN':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  }
}