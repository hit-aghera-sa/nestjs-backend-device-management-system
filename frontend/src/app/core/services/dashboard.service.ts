import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  getOverview() {
    return this.http.get(`${environment.apiUrl}/dashboard/overview`);
  }

  getRecent(limit: number = 10) {
    return this.http.get(`${environment.apiUrl}/dashboard/recent?limit=${limit}`);
  }

  getCategoryStats() {
    return this.http.get(`${environment.apiUrl}/dashboard/stats`);
  }

  getActiveAssignments() {
    return this.http.get<any>(`${environment.apiUrl}/assignments/active/count`, {
      withCredentials: true
    });
  }
}
