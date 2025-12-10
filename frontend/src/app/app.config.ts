import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { authGuard } from './core/guards/auth.guard';
import { masterAdminGuard } from './core/guards/master-admin.guard';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'admin-management',
    canActivate: [authGuard, masterAdminGuard],
    loadComponent: () =>
      import('./features/admin/admin-list/admin-list.component')
        .then(m => m.AdminListComponent)
  },

  {
    path: 'admin-management/create',
    canActivate: [authGuard, masterAdminGuard],
    loadComponent: () =>
      import('./features/admin/admin-create/admin-create.component')
        .then(m => m.AdminCreateComponent)
  },

  {
    path: 'admin-management/view/:id',
    canActivate: [authGuard, masterAdminGuard],
    loadComponent: () => import('./features/admin/admin-view/admin-view.component')
      .then(m => m.AdminViewComponent)
  },

  {
    path: 'admin-management/edit/:id',
    canActivate: [authGuard, masterAdminGuard],
    loadComponent: () =>
      import('./features/admin/admin-edit/admin-edit.component')
        .then(m => m.AdminEditComponent)
  },

  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },

  // {
  //   path: 'employees',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/employees/employees.component').then(m => m.EmployeesComponent)
  // },
  // {
  //   path: 'devices',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/devices/devices.component').then(m => m.DevicesComponent)
  // },
  // {
  //   path: 'assignments',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/assignments/assignments.component').then(m => m.AssignmentsComponent)
  // },
  // {
  //   path: 'stock',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/stock/stock.component').then(m => m.StockComponent)
  // },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login', pathMatch: 'full' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    // --- Correct API for Angular 20 Zoneless Mode ---
    provideZonelessChangeDetection(),

    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
