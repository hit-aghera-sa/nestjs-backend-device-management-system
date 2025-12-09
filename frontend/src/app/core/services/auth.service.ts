import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthState, LoginCredentials, LoginResponse } from '../models/auth.model';

const AUTH_STORAGE_KEY = 'auth_state';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private state = signal<AuthState>({
    token: null,
    user: null
  });

  isAuthenticated = computed(() => !!this.state().token);
  currentUser = computed(() => this.state().user);

  constructor() {
    this.loadAuthState();
  }

  // -----------------------------------------------------------
  // Load state from localStorage on app reload
  // -----------------------------------------------------------
  private loadAuthState(): void {
    const savedState = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedState) {
      try {
        this.state.set(JSON.parse(savedState));
      } catch (e) {
        this.clearAuthState();
      }
    }
  }

  private saveAuthState(): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.state()));
  }

  private clearAuthState(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.state.set({ token: null, user: null });
  }

  // -----------------------------------------------------------
  // LOGIN
  // -----------------------------------------------------------
  login(credentials: LoginCredentials): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
        .subscribe({
          next: (res: any) => {
            const token = res?.data?.token;
            const user = res?.data?.admin;

            if (!token) {
              resolve(false);
              return;
            }

            // Save to localStorage
            localStorage.setItem('token', token);

            // Update signal state  <-- REQUIRED
            this.state.set({ token, user });
            this.saveAuthState();

            resolve(true);
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }


  // -----------------------------------------------------------
  // LOGOUT
  // -----------------------------------------------------------
  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  // -----------------------------------------------------------
  // Helper Methods
  // -----------------------------------------------------------
  getAuthHeaders(): { [header: string]: string } {
    const token = this.state().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getToken(): string | null {
    return this.state().token;
  }

  getUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (err) {
      return null;
    }
  }


}
