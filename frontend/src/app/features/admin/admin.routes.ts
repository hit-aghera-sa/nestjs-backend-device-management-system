import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { masterAdminGuard } from '../../core/guards/master-admin.guard';

export const ADMIN_ROUTES: Routes = [
{
    path: '',
    canActivate: [authGuard, masterAdminGuard],
    loadComponent: () =>
      import('./admin-list/admin-list.component')
        .then(m => m.AdminListComponent)
  },

  {
    path: 'create',
    canActivate: [authGuard, masterAdminGuard],
    loadComponent: () =>
      import('./admin-create/admin-create.component')
        .then(m => m.AdminCreateComponent)
  },

  {
    path: 'view/:id',
    canActivate: [authGuard, masterAdminGuard],
    loadComponent: () =>
      import('./admin-view/admin-view.component')
        .then(m => m.AdminViewComponent)
  },

  {
    path: 'edit/:id',
    canActivate: [authGuard, masterAdminGuard],
    loadComponent: () =>
      import('./admin-edit/admin-edit.component')
        .then(m => m.AdminEditComponent)
  }
];