import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private http = inject(HttpClient);

  getAssignments() {
    return this.http.get(`${environment.apiUrl}/assignments`);
  }

  getAssignmentById(id: string) {
    return this.http.get(`${environment.apiUrl}/assignments/${id}`);
  }

  createAssignment(data: any) {
    return this.http.post(`${environment.apiUrl}/assignments`, data);
  }

  returnDevice(id: string, notes: string) {
    return this.http.patch(
      `${environment.apiUrl}/assignments/${id}/return`,
      { notes }
    );
  }
}
