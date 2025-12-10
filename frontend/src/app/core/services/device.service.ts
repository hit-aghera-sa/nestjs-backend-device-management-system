import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/devices`;  // ✅ FIXED

  getDevices(params?: any): Observable<any> {
    return this.http.get<any>(this.baseUrl, { params });
  }

  getDeviceById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createDevice(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  updateDevice(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

    updateDeviceStatus(id: string, status: string) {
    return this.http.patch(`${environment.apiUrl}/devices/${id}/status`, { status });
    }

  deleteDevice(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
