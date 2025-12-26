import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // allow /auth/*
  if (state.url.startsWith('/auth')) return true;

  // already logged in in memory
  if (auth.isAuthenticated()) return true;

  // wait for backend session check
  const ok = await auth.checkAuth();

  if (ok) return true;

  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
