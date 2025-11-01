import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KardexService } from '../../../core/services/kardex.service';
import { BodegaService } from '../../../core/services/bodega.service';
import { ProductoService } from '../../../core/services/producto.service';
import { Kardex } from '../../../core/models/kardex.model';
import { Bodega } from '../../../core/models/bodega.model';
import { Producto } from '../../../core/models/producto.model';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-kardex-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './kardex-list.component.html',
  styleUrls: ['./kardex-list.component.scss']
})
export class KardexListComponent implements OnInit, AfterViewInit {
  @ViewChild('saldoChart', { static: false }) saldoChartRef!: ElementRef;
  @ViewChild('entradasChart', { static: false }) entradasChartRef!: ElementRef;
  @ViewChild('salidasChart', { static: false }) salidasChartRef!: ElementRef;
  @ViewChild('bodegaChart', { static: false }) bodegaChartRef!: ElementRef;
  @ViewChild('productoChart', { static: false }) productoChartRef!: ElementRef;
  @ViewChild('tipoChart', { static: false }) tipoChartRef!: ElementRef;
  
  movimientos: Kardex[] = [];
  filteredMovimientos: Kardex[] = [];
  loading = false;
  error: string | null = null;
  
  // Charts
  private saldoChart: any;
  private entradasChart: any;
  private salidasChart: any;
  private bodegaChart: any;
  private productoChart: any;
  private tipoChart: any;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  bodegaId: number | null = null;
  productoId: number | null = null;
  tipoOperacion: string = '';
  searchTerm: string = '';
  showFilters = true;

  // Datos para filtros
  bodegas: Bodega[] = [];
  productos: Producto[] = [];

  // Paginación
  currentPage = 1;
  pageSize = 10;
  sortField = 'fecha';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Gráficas
  chartType: 'line' | 'bar' = 'line';
  chartTimeRange: 'day' | 'week' | 'month' = 'month';

  constructor(
    private kardexService: KardexService,
    private bodegaService: BodegaService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setDefaultDates();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.filteredMovimientos.length > 0) {
        this.renderCharts();
      }
    }, 500);
  }

  setDefaultDates(): void {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    this.fechaInicio = lastMonth.toISOString().split('T')[0];
    this.fechaFin = today.toISOString().split('T')[0];
  }

  loadInitialData(): void {
    this.loading = true;
    
    Promise.all([
      this.loadMovimientos(),
      this.loadBodegas(),
      this.loadProductos()
    ]).finally(() => {
      this.loading = false;
    });
  }

  loadMovimientos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.kardexService.getAll().subscribe({
        next: (data) => {
          this.movimientos = data;
          this.applyFilters();
          resolve();
        },
        error: (err) => {
          this.error = 'Error al cargar movimientos';
          console.error(err);
          reject(err);
        }
      });
    });
  }

  loadBodegas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bodegaService.getAll().subscribe({
        next: (data) => {
          this.bodegas = data.filter(b => b.activo);
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar bodegas:', err);
          reject(err);
        }
      });
    });
  }

  loadProductos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.productoService.getAll().subscribe({
        next: (data) => {
          this.productos = data.filter(p => p.activo);
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          reject(err);
        }
      });
    });
  }

  // Filtros
  applyFilters(): void {
    let filtered = this.movimientos;

    // Filtro por fechas
    if (this.fechaInicio) {
      const startDate = new Date(this.fechaInicio);
      filtered = filtered.filter(mov => new Date(mov.fecha) >= startDate);
    }

    if (this.fechaFin) {
      const endDate = new Date(this.fechaFin);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(mov => new Date(mov.fecha) <= endDate);
    }

    // Filtro por bodega
    if (this.bodegaId) {
      filtered = filtered.filter(mov => mov.bodega?.id === this.bodegaId);
    }

    // Filtro por producto
    if (this.productoId) {
      filtered = filtered.filter(mov => mov.producto?.id === this.productoId);
    }

    // Filtro por tipo de operación
    if (this.tipoOperacion) {
      filtered = filtered.filter(mov => mov.tipoMovimiento?.tipo === this.tipoOperacion);
    }

    // Filtro por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(mov => 
        mov.bodega?.nombre.toLowerCase().includes(term) ||
        mov.producto?.nombre.toLowerCase().includes(term) ||
        mov.tipoMovimiento?.nombre.toLowerCase().includes(term)
      );
    }

    // Ordenamiento
    filtered = this.sortMovimientos(filtered);

    this.filteredMovimientos = filtered;
    this.currentPage = 1;

    // Actualizar gráficas
    setTimeout(() => {
      this.renderCharts();
    }, 100);
  }

  clearFilters(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.bodegaId = null;
    this.productoId = null;
    this.tipoOperacion = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  sortMovimientos(movimientos: Kardex[]): Kardex[] {
    return movimientos.sort((a, b) => {
      let aValue: any = this.getNestedValue(a, this.sortField);
      let bValue: any = this.getNestedValue(b, this.sortField);

      if (this.sortField === 'fecha') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕️';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  // Paginación
  get totalPages(): number {
    return Math.ceil(this.filteredMovimientos.length / this.pageSize);
  }

  get displayedMovimientos(): Kardex[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredMovimientos.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page !== -1 && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }
    
    return pages;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  // Gráficas - SEPARADAS
  renderCharts(): void {
    this.renderSaldoChart();
    this.renderEntradasChart();
    this.renderSalidasChart();
    this.renderBodegaChart();
    this.renderProductoChart();
    this.renderTipoChart();
  }

  renderSaldoChart(): void {
    if (!this.saldoChartRef?.nativeElement || this.filteredMovimientos.length === 0) return;

    const chartData = this.getSaldoChartData();
    if (chartData.labels.length === 0) return;

    if (this.saldoChart) {
      this.saldoChart.destroy();
    }

    const ctx = this.saldoChartRef.nativeElement.getContext('2d');
    
    this.saldoChart = new Chart(ctx, {
      type: this.chartType,
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Saldo de Inventario',
            data: chartData.saldos,
            borderColor: '#007bff',
            backgroundColor: this.chartType === 'bar' ? 'rgba(0, 123, 255, 0.8)' : 'rgba(0, 123, 255, 0.1)',
            borderWidth: 3,
            fill: this.chartType === 'line',
            tension: 0.4,
            pointBackgroundColor: '#007bff',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Evolución del Saldo'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Tiempo'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Cantidad'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  renderEntradasChart(): void {
    if (!this.entradasChartRef?.nativeElement || this.filteredMovimientos.length === 0) return;

    const chartData = this.getEntradasChartData();
    if (chartData.labels.length === 0) return;

    if (this.entradasChart) {
      this.entradasChart.destroy();
    }

    const ctx = this.entradasChartRef.nativeElement.getContext('2d');
    
    this.entradasChart = new Chart(ctx, {
      type: this.chartType,
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Entradas/Compras',
            data: chartData.entradas,
            borderColor: '#28a745',
            backgroundColor: this.chartType === 'bar' ? 'rgba(40, 167, 69, 0.8)' : 'rgba(40, 167, 69, 0.1)',
            borderWidth: 2,
            fill: this.chartType === 'line',
            tension: 0.4,
            pointBackgroundColor: '#28a745',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Evolución de Entradas'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Tiempo'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Cantidad'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  renderSalidasChart(): void {
    if (!this.salidasChartRef?.nativeElement || this.filteredMovimientos.length === 0) return;

    const chartData = this.getSalidasChartData();
    if (chartData.labels.length === 0) return;

    if (this.salidasChart) {
      this.salidasChart.destroy();
    }

    const ctx = this.salidasChartRef.nativeElement.getContext('2d');
    
    this.salidasChart = new Chart(ctx, {
      type: this.chartType,
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Salidas/Ventas',
            data: chartData.salidas,
            borderColor: '#dc3545',
            backgroundColor: this.chartType === 'bar' ? 'rgba(220, 53, 69, 0.8)' : 'rgba(220, 53, 69, 0.1)',
            borderWidth: 2,
            fill: this.chartType === 'line',
            tension: 0.4,
            pointBackgroundColor: '#dc3545',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Evolución de Salidas'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Tiempo'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Cantidad'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  renderBodegaChart(): void {
    if (!this.bodegaChartRef?.nativeElement || this.filteredMovimientos.length === 0) return;

    const chartData = this.getBodegaChartData();
    const ctx = this.bodegaChartRef.nativeElement.getContext('2d');

    if (this.bodegaChart) this.bodegaChart.destroy();

    this.bodegaChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { 
            position: 'bottom'
          }
        }
      }
    });
  }

  renderProductoChart(): void {
    if (!this.productoChartRef?.nativeElement || this.filteredMovimientos.length === 0) return;

    const chartData = this.getProductoChartData();
    const ctx = this.productoChartRef.nativeElement.getContext('2d');

    if (this.productoChart) this.productoChart.destroy();

    this.productoChart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  renderTipoChart(): void {
    if (!this.tipoChartRef?.nativeElement || this.filteredMovimientos.length === 0) return;

    const chartData = this.getTipoChartData();
    const ctx = this.tipoChartRef.nativeElement.getContext('2d');

    if (this.tipoChart) this.tipoChart.destroy();

    this.tipoChart = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // MÉTODOS PARA DATOS DE GRÁFICAS SEPARADAS
  getSaldoChartData(): any {
    const sortedMovimientos = [...this.filteredMovimientos].sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    if (sortedMovimientos.length === 0) {
      return { labels: [], saldos: [] };
    }

    const labels: string[] = [];
    const saldos: number[] = [];

    sortedMovimientos.forEach(mov => {
      const fechaLabel = new Date(mov.fecha).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit'
      });
      
      labels.push(fechaLabel);
      saldos.push(mov.saldoNuevo);
    });

    return { labels, saldos };
  }

  getEntradasChartData(): any {
    const entradasMovimientos = this.filteredMovimientos
      .filter(mov => mov.tipoMovimiento?.tipo === 'ENTRADA')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    if (entradasMovimientos.length === 0) {
      return { labels: [], entradas: [] };
    }

    const labels: string[] = [];
    const entradas: number[] = [];

    entradasMovimientos.forEach(mov => {
      const fechaLabel = new Date(mov.fecha).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit'
      });
      
      labels.push(fechaLabel);
      entradas.push(mov.cantidad);
    });

    return { labels, entradas };
  }

  getSalidasChartData(): any {
    const salidasMovimientos = this.filteredMovimientos
      .filter(mov => mov.tipoMovimiento?.tipo === 'SALIDA')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    if (salidasMovimientos.length === 0) {
      return { labels: [], salidas: [] };
    }

    const labels: string[] = [];
    const salidas: number[] = [];

    salidasMovimientos.forEach(mov => {
      const fechaLabel = new Date(mov.fecha).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit'
      });
      
      labels.push(fechaLabel);
      salidas.push(mov.cantidad);
    });

    return { labels, salidas };
  }

  getBodegaChartData(): any {
    const bodegaData: any = {};
    
    this.filteredMovimientos.forEach(mov => {
      const bodegaName = mov.bodega?.nombre || 'Sin Bodega';
      bodegaData[bodegaName] = (bodegaData[bodegaName] || 0) + 1;
    });

    return {
      labels: Object.keys(bodegaData),
      datasets: [{
        data: Object.values(bodegaData),
        backgroundColor: this.generateColors(Object.keys(bodegaData).length)
      }]
    };
  }

  getProductoChartData(): any {
    const productoData: any = {};
    
    this.filteredMovimientos.forEach(mov => {
      const productoName = mov.producto?.nombre || 'Sin Producto';
      if (!productoData[productoName]) {
        productoData[productoName] = 0;
      }
      productoData[productoName] += mov.cantidad;
    });

    const topProductos = Object.entries(productoData)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5);

    return {
      labels: topProductos.map(([name]) => name),
      datasets: [{
        label: 'Cantidad Movida',
        data: topProductos.map(([,count]) => count),
        backgroundColor: '#007bff'
      }]
    };
  }

  getTipoChartData(): any {
    const tipoData: any = {};
    
    this.filteredMovimientos.forEach(mov => {
      const tipoName = mov.tipoMovimiento?.nombre || 'Sin Tipo';
      tipoData[tipoName] = (tipoData[tipoName] || 0) + 1;
    });

    return {
      labels: Object.keys(tipoData),
      datasets: [{
        data: Object.values(tipoData),
        backgroundColor: this.generateColors(Object.keys(tipoData).length)
      }]
    };
  }

  generateColors(count: number): string[] {
    const baseColors = [
      '#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1',
      '#e83e8c', '#fd7e14', '#20c997', '#6610f2', '#d63384'
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }

  // MÉTODO RESUMEN
  getResumen(): any {
    let entradas = 0;
    let salidas = 0;
    let saldoFinal = 0;

    // Calcular entradas y salidas sumando las cantidades
    this.filteredMovimientos.forEach(mov => {
      if (mov.tipoMovimiento?.tipo === 'ENTRADA') {
        entradas += Number(mov.cantidad);
      } else if (mov.tipoMovimiento?.tipo === 'SALIDA') {
        salidas += Number(mov.cantidad);
      }
    });

    // Obtener el saldo final del último movimiento (ordenado por fecha)
    if (this.filteredMovimientos.length > 0) {
      const movimientosOrdenados = [...this.filteredMovimientos].sort((a, b) => 
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
      saldoFinal = movimientosOrdenados[movimientosOrdenados.length - 1]?.saldoNuevo || 0;
    }

    return {
      entradas: entradas,
      salidas: salidas,
      saldoFinal: saldoFinal,
      totalMovimientos: this.filteredMovimientos.length
    };
  }

  changeChartType(type: 'line' | 'bar'): void {
    this.chartType = type;
    this.renderCharts();
  }

  changeTimeRange(range: 'day' | 'week' | 'month'): void {
    this.chartTimeRange = range;
    this.renderCharts();
  }

  // Exportación
  exportToCSV(): void {
    const headers = ['Fecha', 'Bodega', 'Producto', 'Tipo Movimiento', 'Cantidad', 'Saldo Anterior', 'Saldo Nuevo'];
    const csvData = this.filteredMovimientos.map(mov => [
      new Date(mov.fecha).toLocaleDateString('es-ES'),
      mov.bodega?.nombre || '',
      mov.producto?.nombre || '',
      mov.tipoMovimiento?.nombre || '',
      mov.cantidad,
      mov.saldoAnterior,
      mov.saldoNuevo
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kardex_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}