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
  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      );

      const token = response?.data?.token;
      const user = response?.data?.admin;

      // If backend sends incorrect structure OR login fails
      if (!token || !user) return false;

      // Save state
      this.state.set({ token, user });
      this.saveAuthState();

      return true;

    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
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
}
