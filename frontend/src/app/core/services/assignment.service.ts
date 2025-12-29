import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/assignments`;

  getAssignments(params?: any) {
    return this.http.get(this.baseUrl, { params });
  }

  getAssignmentById(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createAssignment(data: any) {
    return this.http.post(this.baseUrl, data);
  }

  returnDevice(
    id: string,
    notes: string,
    deviceStatus: 'AVAILABLE' | 'DAMAGED' | 'MAINTENANCE'
  ) {
    return this.http.patch(`${this.baseUrl}/${id}/return`, {
      notes,
      deviceStatus,
    });
  }

  deleteAssignment(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}