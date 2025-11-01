import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContainerService, Container } from '../../../core/services/container.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-containers-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './containers-list.component.html',
  styleUrls: ['./containers-list.component.scss']
})
export class ContainersListComponent implements OnInit, AfterViewInit {
  @ViewChild('containersChart', { static: false }) chartRef!: ElementRef;
  
  containers: Container[] = [];
  loading = false;
  error: string | null = null;
  private chart: any;

  // Propiedades para el selector de gráficas
  chartType: 'pie' | 'bar' | 'doughnut' = 'doughnut';

  constructor(
    private containerService: ContainerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContainers();
  }

  ngAfterViewInit() {
    // La gráfica se renderizará cuando los datos estén cargados
  }

  loadContainers(): void {
    this.loading = true;
    this.containerService.getAll().subscribe({
      next: (data) => {
        this.containers = data;
        this.loading = false;
        // Renderizar gráfica después de cargar los datos
        setTimeout(() => {
          this.renderChart();
        }, 100);
      },
      error: (err) => {
        this.error = 'Error al cargar containers';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/containers/nuevo']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/containers', id, 'edit']);
  }

  // Métodos para filtros
  getContainersActivos() {
    return this.containers.filter(container => container.activo);
  }

  getContainersInactivos() {
    return this.containers.filter(container => !container.activo);
  }

  // Métodos para el selector de gráficas
  changeChartType(type: 'pie' | 'bar' | 'doughnut') {
    this.chartType = type;
    this.renderChart();
  }

  // Datos para la gráfica
  getChartData() {
    const activos = this.getContainersActivos().length;
    const inactivos = this.getContainersInactivos().length;
    
    return {
      labels: ['Containers Activos', 'Containers Inactivos'],
      datasets: [{
        data: [activos, inactivos],
        backgroundColor: ['#28a745', '#dc3545'],
        borderColor: ['#218838', '#c82333'],
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