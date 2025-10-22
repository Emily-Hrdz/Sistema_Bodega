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
    this.auditLogService.getAll(100).subscribe({ // CORREGIDO: agregado parámetro limit
      next: (data) => {
        this.auditLogs = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar auditoría';
        this.loading = false;
        console.error(err);
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