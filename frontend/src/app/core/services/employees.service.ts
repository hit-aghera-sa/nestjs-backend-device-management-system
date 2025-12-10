import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Employee {
  _id: string;
  fullName: string;
  email: string;
  department: string;
  designation?: string;
  contactNumber?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isVerified: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/employees`;

  getAll(params?: any) {
    return this.http.get<{ status: string; data: Employee[] }>(`${environment.apiUrl}/employees`,{ params });
  }

  getById(id: string) {
    return this.http.get<{ status: string; data: Employee }>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Employee>) {
    return this.http.post<{ status: string; data: Employee }>(this.baseUrl, data);
  }

  update(id: string, data: Partial<Employee>) {
    return this.http.patch<{ status: string; data: Employee }>(`${this.baseUrl}/${id}`, data);
  }

  verify(id: string) {
    return this.http.patch(`${environment.apiUrl}/employees/${id}/verify`, {});
  }

  resendVerification(email: string) {
    return this.http.post(`${environment.apiUrl}/employees/resend-verification`, { email });
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/employees/${id}`);
  }

}
