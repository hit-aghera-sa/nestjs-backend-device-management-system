import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // allow /auth/**
  if (state.url.startsWith('/auth')) return true;

  // already authenticated in memory
  if (auth.isAuthenticated()) return true;

  // attempt backend session restore (cookie required)
  const ok = await auth.checkAuth();

  if (ok) return true;

  // otherwise redirect to login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
