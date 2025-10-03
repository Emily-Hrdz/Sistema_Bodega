import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/layout/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Bodegas
      {
        path: 'bodegas/nuevo',
        loadComponent: () =>
          import('./features/bodegas/bodega-form/bodega-form.component').then(m => m.BodegaFormComponent)
      },
      {
        path: 'bodegas/:id/edit',
        loadComponent: () =>
          import('./features/bodegas/bodega-form/bodega-form.component').then(m => m.BodegaFormComponent)
      },
      {
        path: 'bodegas/list',
        loadComponent: () =>
          import('./features/bodegas/bodegas-list/bodegas-list.component').then(m => m.BodegasListComponent)
      },

      // Productos
      {
        path: 'productos/nuevo',
        loadComponent: () =>
          import('./features/productos/producto-form/producto-form.component').then(m => m.ProductoFormComponent)
      },
      {
        path: 'productos/:id/edit',
        loadComponent: () =>
          import('./features/productos/producto-form/producto-form.component').then(m => m.ProductoFormComponent)
      },
      {
        path: 'productos/list',
        loadComponent: () =>
          import('./features/productos/producto-list/productos-list.component').then(m => m.ProductosListComponent)
      },

      // Tipos de Producto
      {
        path: 'tipos-producto/nuevo',
        loadComponent: () =>
          import('./features/producto-tipo/producto-tipo-form/tipo-producto.component').then(m => m.TipoProductoFormComponent)
      },
      {
        path: 'tipos-producto/:id/edit',
        loadComponent: () =>
          import('./features/producto-tipo/producto-tipo-form/tipo-producto.component').then(m => m.TipoProductoFormComponent)
      },

      
      {
        path: 'tipos-producto',
        loadComponent: () =>
          import('./features/producto-tipo/producto-tipo-form/tipo-producto.component').then(m => m.TipoProductoFormComponent)
      },

      // Kardex
      {
        path: 'kardex',
        loadComponent: () =>
          import('./features/kardex/kardex-form/kardex-form.component').then(m => m.KardexFormComponent)
      },

      // Redirección por defecto
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // Redirección para rutas no existentes
  {
    path: '**',
    redirectTo: 'kardex'
  }
];
