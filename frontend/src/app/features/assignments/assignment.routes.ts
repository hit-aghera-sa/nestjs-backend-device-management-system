import { Routes } from '@angular/router';

export const ASSIGNMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./assignment-list/assignment-list.component')
        .then(m => m.AssignmentListComponent)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./assignment-create/assignment-create.component')
        .then(m => m.AssignmentCreateComponent)
  },
  {
    path: 'return/:id',
    loadComponent: () =>
      import('./assignment-return/assignment-return.component')
        .then(m => m.AssignmentReturnComponent)
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./assignment-history/assignment-history.component')
        .then(m => m.AssignmentHistoryComponent)
  },

  {
    path: 'view/:id',
    loadComponent: () =>
      import('./assignment-view/assignment-view.component')
        .then(m => m.AssignmentViewComponent)
  }

];
