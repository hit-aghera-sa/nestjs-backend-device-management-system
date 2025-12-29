import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { masterAdminGuard } from './core/guards/master-admin.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  {
    path: '',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      {
        path: 'admin-management',
        canActivate: [masterAdminGuard],
        loadChildren: () =>
          import('./features/admin/admin.routes')
            .then(m => m.ADMIN_ROUTES)
      },

      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component')
            .then(m => m.ProfileComponent)
      },

      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employees/employees.routes')
            .then(m => m.EMPLOYEE_ROUTES)
      },

      {
        path: 'devices',
        loadChildren: () =>
          import('./features/devices/devices.routes')
            .then(m => m.DEVICES_ROUTES)
      },

      {
        path: 'assignments',
        loadChildren: () =>
          import('./features/assignments/assignment.routes')
            .then(m => m.ASSIGNMENT_ROUTES)
      },

      {
        path: 'stock',
        loadChildren: () =>
          import('./features/stock/stock.router')
            .then(m => m.STOCK_ROUTES)
      },

      // default after login
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // ---------------- FALLBACK ----------------
  { path: '**', redirectTo: '/auth/login' }
];
