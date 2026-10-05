import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { featureAvailabilityGuard } from './core/guards/feature-availability.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/layout/sidebar/sidebar.component').then(m => m.SidebarComponent),
    children: [
      {
        path: 'pendiente',
        loadComponent: () =>
          import('./features/layout/feature-pending/feature-pending.component').then(m => m.FeaturePendingComponent)
      },
      // Dashboard
      {
        path: 'dashboard',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'dashboard', featureLabel: 'Dashboard' },
        loadComponent: () =>
          import('./features/layout/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Bodegas
      {
        path: 'bodegas/nuevo',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'bodegas', featureLabel: 'Bodegas' },
        loadComponent: () =>
          import('./features/bodegas/bodega-form/bodega-form.component').then(m => m.BodegaFormComponent)
      },
      {
        path: 'bodegas/:id/edit',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'bodegas', featureLabel: 'Bodegas' },
        loadComponent: () =>
          import('./features/bodegas/bodega-form/bodega-form.component').then(m => m.BodegaFormComponent)
      },
      {
        path: 'bodegas/list',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'bodegas', featureLabel: 'Bodegas' },
        loadComponent: () =>
          import('./features/bodegas/bodegas-list/bodegas-list.component').then(m => m.BodegasListComponent)
      },

      // Productos
      {
        path: 'productos/nuevo',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'productos', featureLabel: 'Productos' },
        loadComponent: () =>
          import('./features/productos/producto-form/producto-form.component').then(m => m.ProductoFormComponent)
      },
      {
        path: 'productos/:id/edit',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'productos', featureLabel: 'Productos' },
        loadComponent: () =>
          import('./features/productos/producto-form/producto-form.component').then(m => m.ProductoFormComponent)
      },
      {
        path: 'productos/list',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'productos', featureLabel: 'Productos' },
        loadComponent: () =>
          import('./features/productos/producto-list/productos-list.component').then(m => m.ProductosListComponent)
      },

      // Tipos de Producto
      {
        path: 'tipos-producto/nuevo',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'productos', featureLabel: 'Productos' },
        loadComponent: () =>
          import('./features/producto-tipo/producto-tipo-form/tipo-producto.component').then(m => m.TipoProductoFormComponent)
      },
      {
        path: 'tipos-producto/:id/edit',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'productos', featureLabel: 'Productos' },
        loadComponent: () =>
          import('./features/producto-tipo/producto-tipo-form/tipo-producto.component').then(m => m.TipoProductoFormComponent)
      },
      {
        path: 'tipos-producto',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'productos', featureLabel: 'Productos' },
        loadComponent: () =>
          import('./features/producto-tipo/producto-tipo-form/tipo-producto.component').then(m => m.TipoProductoFormComponent)
      },

      // Kardex
      {
        path: 'kardex/nuevo',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'kardex', featureLabel: 'Kardex' },
        loadComponent: () =>
          import('./features/kardex/kardex-form/kardex-form.component').then(m => m.KardexFormComponent)
      },
      {
       path: 'kardex/:id/edit',  // ← NUEVA RUTA PARA EDITAR
       canActivate: [featureAvailabilityGuard],
       data: { feature: 'kardex', featureLabel: 'Kardex' },
       loadComponent: () =>
          import('./features/kardex/kardex-form/kardex-form.component').then(m => m.KardexFormComponent)
   },
      {
        path: 'kardex/list',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'kardex', featureLabel: 'Kardex' },
        loadComponent: () =>
          import('./features/kardex/kardex-list/kardex-list.component').then(m => m.KardexListComponent)
      },
      {
        path: 'kardex',
        redirectTo: 'kardex/list',
        pathMatch: 'full'
      },


      // Tipos de Movimiento

     {
       path: 'tipos-movimiento/nuevo',
       canActivate: [featureAvailabilityGuard],
       data: { feature: 'kardex', featureLabel: 'Kardex' },
       loadComponent: () =>
         import('./features/tipo-movimiento/tipo-movimiento-form/tipo-movimiento-form.component').then(m => m.TipoMovimientoFormComponent)
     },
     {
       path: 'tipos-movimiento/:id/edit',
       canActivate: [featureAvailabilityGuard],
       data: { feature: 'kardex', featureLabel: 'Kardex' },
       loadComponent: () =>
         import('./features/tipo-movimiento/tipo-movimiento-form/tipo-movimiento-form.component').then(m => m.TipoMovimientoFormComponent)
    },
    {
       path: 'tipos-movimiento',
       canActivate: [featureAvailabilityGuard],
       data: { feature: 'kardex', featureLabel: 'Kardex' },
       loadComponent: () =>
         import('./features/tipo-movimiento/tipo-movimiento-list/tipo-movimiento-list.component').then(m => m.TipoMovimientoListComponent)
    },

      // Containers
      {
        path: 'containers/nuevo',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'containers', featureLabel: 'Contenedores' },
        loadComponent: () =>
          import('./features/containers/container-form/container-form.component').then(m => m.ContainerFormComponent)
      },
      {
        path: 'containers/:id/edit',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'containers', featureLabel: 'Contenedores' },
        loadComponent: () =>
          import('./features/containers/container-form/container-form.component').then(m => m.ContainerFormComponent)
      },
      {
        path: 'containers',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'containers', featureLabel: 'Contenedores' },
        loadComponent: () =>
          import('./features/containers/containers-list/containers-list.component').then(m => m.ContainersListComponent)
      },

      // Lotes
      {
        path: 'lotes/nuevo',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'lotes', featureLabel: 'Lotes' },
        loadComponent: () =>
          import('./features/lotes/lote-form/lote-form.component').then(m => m.LoteFormComponent)
      },
      {
        path: 'lotes/:id/edit',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'lotes', featureLabel: 'Lotes' },
        loadComponent: () =>
          import('./features/lotes/lote-form/lote-form.component').then(m => m.LoteFormComponent)
      },
      {
        path: 'lotes',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'lotes', featureLabel: 'Lotes' },
        loadComponent: () =>
          import('./features/lotes/lotes-list/lotes-list.component').then(m => m.LotesListComponent)
      },

      // Clientes
      {
        path: 'clientes/nuevo',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'clientes', featureLabel: 'Clientes' },
        loadComponent: () =>
          import('./features/clientes/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'clientes/:id/edit',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'clientes', featureLabel: 'Clientes' },
        loadComponent: () =>
          import('./features/clientes/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'clientes',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'clientes', featureLabel: 'Clientes' },
        loadComponent: () =>
          import('./features/clientes/clientes-list/clientes-list.component').then(m => m.ClientesListComponent)
      },

      // Auditoría
      {
        path: 'audit-logs',
        canActivate: [featureAvailabilityGuard],
        data: { feature: 'auditoria', featureLabel: 'Auditoría' },
        loadComponent: () =>
          import('./features/auditoria/audit-logs-list/audit-logs-list.component').then(m => m.AuditLogsListComponent)
      },

      // Redirección por defecto
      {
        path: '',
        redirectTo: 'bodegas/list',
        pathMatch: 'full'
      }
    ]
  },
  // Redirección para rutas no existentes
  {
    path: '**',
    redirectTo: 'bodegas/list'
  }
];
