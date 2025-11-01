import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto.model';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './productos-list.component.html',
  styleUrls: ['./productos-list.component.scss']
})
export class ProductosListComponent implements OnInit, AfterViewInit {
  @ViewChild('productosChart', { static: false }) chartRef!: ElementRef;
  
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  loading = false;
  error: string | null = null;
  private chart: any;

  // Propiedades para filtros y paginación
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  selectedType = '';
  selectedStatus = '';
  sortField: keyof Producto | 'tipoProducto.nombre' = 'nombre';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Propiedades para el selector de gráficas - DONA como predeterminada
  chartType: 'pie' | 'bar' | 'doughnut' = 'doughnut';
  showChart = true;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  ngAfterViewInit() {
    // La gráfica se renderizará cuando los datos estén cargados
  }

  loadProductos(): void {
    this.loading = true;
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productos = data;
        this.applyFilters(); // Aplicar filtros iniciales
        this.loading = false;
        // Renderizar gráfica después de cargar los datos
        setTimeout(() => {
          this.renderChart();
        }, 100);
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteProducto(id: number): void {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.productoService.delete(id).subscribe({
        next: () => {
          this.loadProductos();
        },
        error: (err) => {
          this.error = 'Error al eliminar producto';
          console.error(err);
        }
      });
    }
  }

  getProductosActivos() {
    return this.productos.filter(producto => producto.activo);
  }

  getProductosInactivos() {
    return this.productos.filter(producto => !producto.activo);
  }

  getTiposUnicos() {
    const tipos = this.productos.map(p => p.tipoProducto?.nombre).filter(nombre => nombre);
    return [...new Set(tipos)];
  }

  // CAMBIO: Solo contar productos ACTIVOS en la gráfica
  getProductosPorTipo() {
    const tiposMap = new Map();
    
    // Filtrar solo productos activos
    const productosActivos = this.productos.filter(producto => producto.activo);
    
    productosActivos.forEach(producto => {
      const tipoNombre = producto.tipoProducto?.nombre || 'Sin tipo';
      if (tiposMap.has(tipoNombre)) {
        tiposMap.set(tipoNombre, tiposMap.get(tipoNombre) + 1);
      } else {
        tiposMap.set(tipoNombre, 1);
      }
    });
    
    return Array.from(tiposMap, ([nombre, cantidad]) => ({ nombre, cantidad }));
  }

  // Métodos para el selector de gráficas
  changeChartType(type: 'pie' | 'bar' | 'doughnut') {
    this.chartType = type;
    this.renderChart();
  }

  toggleChart() {
    this.showChart = !this.showChart;
    if (this.showChart) {
      setTimeout(() => {
        this.renderChart();
      }, 100);
    }
  }

  // Métodos para filtros y paginación
  applyFilters() {
    let filtered = this.productos;
    
    // Filtro por búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(p => 
        p.codigo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Filtro por tipo
    if (this.selectedType) {
      filtered = filtered.filter(p => 
        p.tipoProducto?.nombre === this.selectedType
      );
    }
    
    // Filtro por estado
    if (this.selectedStatus) {
      filtered = filtered.filter(p => 
        this.selectedStatus === 'activo' ? p.activo : !p.activo
      );
    }
    
    // Ordenamiento
    filtered = this.sortProducts(filtered);
    
    this.filteredProductos = filtered;
    this.currentPage = 1; // Reset a primera página
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  get totalPages() {
    return Math.ceil(this.filteredProductos.length / this.pageSize);
  }

  get hasActiveFilters() {
    return this.searchTerm || this.selectedType || this.selectedStatus;
  }

  getDisplayedProducts() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredProductos.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
  }

  sortBy(field: keyof Producto | 'tipoProducto.nombre') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: keyof Producto | 'tipoProducto.nombre') {
    if (this.sortField !== field) return '↕️';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  private sortProducts(products: Producto[]): Producto[] {
    return products.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Manejar propiedades anidadas
      if (this.sortField === 'tipoProducto.nombre') {
        aValue = a.tipoProducto?.nombre || '';
        bValue = b.tipoProducto?.nombre || '';
      } else {
        // Para propiedades directas, usar el campo de ordenamiento tipado
        aValue = a[this.sortField as keyof Producto];
        bValue = b[this.sortField as keyof Producto];
      }

      // Manejar valores nulos/undefined
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Convertir a string para comparación case-insensitive si es necesario
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Comparar valores
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private renderChart() {
    if (!this.chartRef?.nativeElement) return;

    const datos = this.getProductosPorTipo();
    if (datos.length === 0) return;

    // Destruir gráfica anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartRef.nativeElement.getContext('2d');
    
    // Limitar a los 10 tipos más comunes si hay muchos
    const datosLimitados = datos.length > 10 
      ? [...datos.sort((a, b) => b.cantidad - a.cantidad).slice(0, 10)]
      : datos;

    const config: any = {
      data: {
        labels: datosLimitados.map(item => item.nombre),
        datasets: [{
          data: datosLimitados.map(item => item.cantidad),
          backgroundColor: [
            '#4361ee', '#3a0ca3', '#7209b7', '#f72585', 
            '#4cc9f0', '#4895ef', '#560bad', '#b5179e',
            '#f72585', '#4cc9f0'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
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
                return `${label}: ${value} productos activos (${percentage}%)`;
              }
            }
          },
          // Agregar título a la gráfica
          title: {
            display: true,
            text: 'Distribución de Productos Activos por Tipo',
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
      config.data.datasets[0].backgroundColor = '#4361ee';
      config.data.datasets[0].borderRadius = 4;
      config.options.indexAxis = 'y';
      config.options.scales = {
        x: { 
          beginAtZero: true, 
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          ticks: { stepSize: 1 },
          title: {
            display: true,
            text: 'Cantidad de Productos Activos'
          }
        },
        y: { 
          grid: { display: false },
          ticks: { font: { size: 11 } }
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

  // Función auxiliar para truncar labels largos (usada en gráfica de barras)
  private truncateLabel(label: string, maxLength: number): string {
    return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
  }
}