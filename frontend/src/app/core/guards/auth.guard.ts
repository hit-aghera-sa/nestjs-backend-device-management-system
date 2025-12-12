import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 🚫 DO NOT block login or register routes
  if (state.url.startsWith('/auth')) {
    return true;
  }

  // 🟢 If token exists in memory or localStorage → allow
  if (auth.isAuthenticated()) {
    return true;
  }

  // 🔴 Not authenticated → go to login, no backend check!
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
