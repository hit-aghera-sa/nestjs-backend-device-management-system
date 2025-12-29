import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const DEVICES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./list/devices-list.component').then(m => m.DevicesListComponent)
  },
  {
    path: 'create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./create/devices-create.component').then(m => m.DeviceCreateComponent)
  },
  {
    path: 'view/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./view/devices-view.component').then(m => m.DeviceViewComponent)
  },
  {
    path: 'edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./edit/devices-edit.component').then(m => m.DeviceEditComponent)
  }
];
