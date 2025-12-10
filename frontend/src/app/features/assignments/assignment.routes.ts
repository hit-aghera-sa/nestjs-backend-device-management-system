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
//   {
//     path: ':id',
//     loadComponent: () =>
//       import('./assignment-view/assignment-view.component')
//         .then(m => m.AssignmentViewComponent)
//   }
];
