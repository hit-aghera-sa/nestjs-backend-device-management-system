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

  {
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/employees/employees-list/employees-list.component')
        .then(m => m.EmployeesListComponent)
  },
  {
    path: 'employees/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/employees/employees-create/employees-create.component')
        .then(m => m.EmployeesCreateComponent)
  },

  {
    path: 'verify-employee',
    loadComponent: () =>
      import('./features/employees/verify-employee/verify-employee.component')
        .then(m => m.VerifyEmployeeComponent)
  },

  {
    path: 'employees/view/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/employees/employees-view/employees-view.component')
        .then(m => m.EmployeesViewComponent)
  },
  {
    path: 'employees/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/employees/employees-edit/employees-edit.component')
        .then(m => m.EmployeesEditComponent)
  },
  {
    path: 'devices',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/devices/devices.routes').then(m => m.DEVICES_ROUTES)
  },

{
  path: 'assignments',
  canActivate: [authGuard],
  loadChildren: () =>
    import('./features/assignments/assignment.routes')
      .then(m => m.ASSIGNMENT_ROUTES)
},

{
  path: 'stock',
  canActivate: [authGuard],
  loadChildren: () =>
    import('./features/stock/stock.router').then(m => m.STOCK_ROUTES)
},

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
