import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

import { authGuard } from './core/guards/auth.guard';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  // {
  //   path: 'dashboard',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  // },
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
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
