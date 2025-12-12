import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginCredentials } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  private state = signal<{ user: any | null }>({
    user: null
  });

  isAuthenticated = computed(() => !!this.state().user);
  currentUser = computed(() => this.state().user);

  constructor() {
    this.checkAuth();
  }

  // ---------------------------------------
  // CHECK AUTH (called on app load)
  // ---------------------------------------
  checkAuth(): Promise<boolean> {
    return new Promise(resolve => {
      this.http
        .get(`${environment.apiUrl}/auth/me`, { withCredentials: true })
        .subscribe({
          next: (res: any) => {
            this.state.set({ user: res.data });
            resolve(true);
          },
          error: () => {
            this.state.set({ user: null });
            resolve(false);
          }
        });
    });
  }

  // ---------------------------------------
  // LOGIN (Cookie is set automatically)
  // ---------------------------------------
async login(credentials: LoginCredentials): Promise<boolean> {
  return new Promise((resolve, reject) => {
    this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    })
    .subscribe({
      next: (res) => {
        const user = res?.data?.admin;

        if (!user) {
          resolve(false);
          return;
        }

        this.state.set({ user });
        this.saveAuthState();
        resolve(true);
      },
      error: (err) => reject(err)
    });
  });
}


  // ---------------------------------------
  // LOGOUT
  // ---------------------------------------
  logout(): void {
    this.http
      .post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.state.set({ user: null });
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          this.state.set({ user: null });
          this.router.navigate(['/auth/login']);
        }
      });
  }

  private saveAuthState(): void {
  localStorage.setItem('auth_state', JSON.stringify(this.state()));
}

private loadAuthState(): void {
  const saved = localStorage.getItem('auth_state');
  if (saved) {
    try {
      this.state.set(JSON.parse(saved));
    } catch {
      this.state.set({ user: null });
    }
  }
}
}
