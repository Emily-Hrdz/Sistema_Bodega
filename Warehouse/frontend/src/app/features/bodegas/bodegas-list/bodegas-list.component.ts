import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BodegaService } from '../../../core/services/bodega.service';
import { Bodega } from '../../../core/models/bodega.model';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-bodegas-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bodegas-list.component.html',
  styleUrls: ['./bodegas-list.component.scss']
})
export class BodegasListComponent implements OnInit, AfterViewInit {
  @ViewChild('bodegasChart', { static: false }) chartRef!: ElementRef;
  
  bodegas: Bodega[] = [];
  loading = false;
  error: string | null = null;
  private chart: any;

  // Propiedades para el selector de gráficas
  chartType: 'pie' | 'bar' | 'doughnut' = 'doughnut';

  constructor(private bodegaService: BodegaService) {}

  ngOnInit(): void {
    this.loadBodegas();
  }

  ngAfterViewInit() {
    // La gráfica se renderizará cuando los datos estén cargados
  }

  loadBodegas(): void {
    this.loading = true;
    this.bodegaService.getAll().subscribe({
      next: (data) => {
        this.bodegas = data;
        this.loading = false;
        // Renderizar gráfica después de cargar los datos
        setTimeout(() => {
          this.renderChart();
        }, 100);
      },
      error: (err) => {
        this.error = 'Error al cargar bodegas';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteBodega(id: number): void {
    if (confirm('¿Está seguro de eliminar esta bodega?')) {
      this.bodegaService.delete(id).subscribe({
        next: () => {
          this.loadBodegas();
        },
        error: (err) => {
          this.error = 'Error al eliminar bodega';
          console.error(err);
        }
      });
    }
  }

  getBodegasActivas() {
    return this.bodegas.filter(bodega => bodega.activo);
  }

  getBodegasInactivas() {
    return this.bodegas.filter(bodega => !bodega.activo);
  }

  // Métodos para el selector de gráficas
  changeChartType(type: 'pie' | 'bar' | 'doughnut') {
    this.chartType = type;
    this.renderChart();
  }

  // Datos para la gráfica
  getChartData() {
    const activas = this.getBodegasActivas().length;
    const inactivas = this.getBodegasInactivas().length;
    
    return {
      labels: ['Bodegas Activas', 'Bodegas Inactivas'],
      datasets: [{
        data: [activas, inactivas],
        backgroundColor: ['#34a853', '#ea4335'],
        borderColor: ['#34a853', '#ea4335'],
        borderWidth: 2
      }]
    };
  }

  private renderChart() {
    if (!this.chartRef?.nativeElement) return;

    const chartData = this.getChartData();
    if (chartData.datasets[0].data.every(val => val === 0)) return;

    // Destruir gráfica anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartRef.nativeElement.getContext('2d');
    
    const config: any = {
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: this.chartType === 'bar' ? 'top' : 'right',
            labels: {
              boxWidth: 12,
              font: { size: 11 },
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          },
          title: {
            display: true,
            text: 'Distribución por Estado',
            font: {
              size: 14
            },
            padding: 20
          }
        }
      }
    };

    // Configuración específica por tipo
    if (this.chartType === 'bar') {
      config.type = 'bar';
      config.options.scales = {
        y: { 
          beginAtZero: true, 
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          ticks: { stepSize: 1 }
        },
        x: { 
          grid: { display: false }
        }
      };
    } else if (this.chartType === 'doughnut') {
      config.type = 'doughnut';
      config.options.cutout = '50%';
    } else {
      config.type = 'pie';
    }

    this.chart = new Chart(ctx, config);
  }
}