import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth`;

  // --------------------------------
  // CURRENT LOGGED IN ADMIN
  // --------------------------------
  getMe() {
    return this.http.get<any>(`${this.baseUrl}/me`);
  }

  // --------------------------------
  // ALL ADMINS
  // --------------------------------
  getAdmins() {
    return this.http.get<any>(`${this.baseUrl}`);
  }

  // --------------------------------
  // SINGLE ADMIN
  // --------------------------------
  getAdminById(id: string) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // --------------------------------
  // CREATE (REGISTER)
  // --------------------------------
  register(payload: {
    fullName: string;
    email: string;
    password: string;
  }) {
    return this.http.post<any>(`${this.baseUrl}/register`, payload);
  }

  // --------------------------------
  // UPDATE ADMIN
  // --------------------------------
  updateAdmin(id: string, payload: any) {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, payload);
  }

  // --------------------------------
  // PROFILE UPDATE (SELF)
  // --------------------------------
  updateProfile(payload: any) {
    return this.http.patch<any>(`${this.baseUrl}/profile`, payload);
  }

  // --------------------------------
  // CHANGE PASSWORD (SELF)
  // --------------------------------
  changePassword(payload: { oldPassword: string; newPassword: string }) {
    return this.http.patch<any>(`${this.baseUrl}/change-password`, payload);
  }

  // --------------------------------
  // ACTIVATE / DEACTIVATE
  // --------------------------------
  deactivate(id: string) {
    return this.http.patch<any>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  activate(id: string) {
    return this.http.patch<any>(`${this.baseUrl}/${id}/activate`, {});
  }
}
