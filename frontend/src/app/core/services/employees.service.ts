import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((k) => {
        const v = params[k];
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get<{ status: string; data: { employees: Employee[]; pagination?: any } }>(
      this.baseUrl,
      { params: httpParams }
    );
  }

  getDevices(params?: any){
    return this.http.get<any>(this.baseUrl, {
      params: params,
      withCredentials: true
    });
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
