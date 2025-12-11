import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-assignment-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-history.component.html'
})
export class AssignmentHistoryComponent implements OnInit {

  private http = inject(HttpClient);

  employees: any[] = [];
  devices: any[] = [];

  selectedEmployee: string = '';
  selectedDevice: string = '';

  history: any[] = [];

  ngOnInit() {
    this.loadEmployees();
    this.loadDevices();
  }

  loadEmployees() {
    this.http.get(`${environment.apiUrl}/employees`)
      .subscribe((res: any) => this.employees = res.data);
  }

  loadDevices() {
    this.http.get(`${environment.apiUrl}/devices`)
      .subscribe((res: any) => this.devices = res.data.devices);
  }

  loadEmployeeHistory() {
    if (!this.selectedEmployee) return;
    this.http.get(`${environment.apiUrl}/assignments/history`, {
      params: { employeeId: this.selectedEmployee },
      withCredentials: true
    })
    .subscribe((res: any) => this.history = res.data);
  }

  loadDeviceHistory() {
    if (!this.selectedDevice) return;
    this.http.get(`${environment.apiUrl}/assignments/history`, {
      params: { deviceId: this.selectedDevice },
      withCredentials: true
    })
    .subscribe((res: any) => this.history = res.data);
  }

  format(date: string) {
    return new Date(date).toLocaleDateString();
  }
}
