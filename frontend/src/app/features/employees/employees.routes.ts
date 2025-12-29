import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees-list/employees-list.component')
        .then(m => m.EmployeesListComponent)
  },

  {
    path: 'create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees-create/employees-create.component')
        .then(m => m.EmployeesCreateComponent)
  },

  {
    path: 'verify-employee',
    loadComponent: () =>
      import('./verify-employee/verify-employee.component')
        .then(m => m.VerifyEmployeeComponent)
  },

  {
    path: 'view/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees-view/employees-view.component')
        .then(m => m.EmployeesViewComponent)
  },

  {
    path: 'edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees-edit/employees-edit.component')
        .then(m => m.EmployeesEditComponent)
  }
];
