import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/layout/sidebar/sidebar.component').then(m => m.SidebarComponent),
    children: [
     
      {
        path: 'bodegas',
        loadComponent: () => import('./features/bodegas/bodega-form/bodega-form.component').then(m => m.BodegaFormComponent)
      },

      {
        path: 'bodegas/list',
        loadComponent: () => import('./features/bodegas/bodegas-list/bodegas-list.component').then(m => m.BodegasListComponent)
      },

      {
        path: 'kardex',
        loadComponent: () => import('./features/kardex/kardex-form/kardex-form.component').then(m => m.KardexFormComponent)
      },
      {
        path: '',
        redirectTo: 'kardex',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'kardex'
  }
];

