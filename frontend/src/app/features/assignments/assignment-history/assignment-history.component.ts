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

  // Dropdown data
  employees = signal<any[]>([]);
  devices = signal<any[]>([]);
  history = signal<any[]>([]);

  // Filters
  selectedEmployee = signal<string>('');
  selectedDevice = signal<string>('');

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadEmployees();
    this.loadDevices();
  }

  // -------------------------------------------------------
  // Load dropdown options
  // -------------------------------------------------------
  loadEmployees() {
    this.http.get<any>(`${environment.apiUrl}/employees`)
      .subscribe({
        next: (res) =>
          this.employees.set(res?.data?.employees || res?.data || []),
        error: () =>
          this.errorMessage.set("Failed to load employees.")
      });
  }

  loadDevices() {
    this.http.get<any>(`${environment.apiUrl}/devices`)
      .subscribe({
        next: (res) =>
          this.devices.set(res?.data?.devices || res?.data || []),
        error: () =>
          this.errorMessage.set("Failed to load devices.")
      });
  }

  // -------------------------------------------------------
  // When employee selected
  // -------------------------------------------------------
loadEmployeeHistory() {
  const emp = this.selectedEmployee();

  if (emp) this.selectedDevice.set('');

  if (!emp) return;   // ← prevent undefined calls

  this.loadHistory();
}

loadDeviceHistory() {
  const dev = this.selectedDevice();

  if (dev) this.selectedEmployee.set('');

  if (!dev) return;   // ← prevent undefined calls

  this.loadHistory();
}

loadHistory() {
  this.history.set([]);
  this.errorMessage.set(null);

  const employeeId = this.selectedEmployee();
  const deviceId = this.selectedDevice();

  if (employeeId && deviceId) {
    this.errorMessage.set("Select either Employee OR Device, not both.");
    return;
  }

  if (!employeeId && !deviceId) return;

  const params: any = {};
  if (employeeId) params.employeeId = employeeId;
  if (deviceId) params.deviceId = deviceId;

  this.loading.set(true);

  this.http.get<any>(`${environment.apiUrl}/assignments/history`, { params })
    .subscribe({
      next: res => {
        this.history.set(res?.data || []);
        this.loading.set(false);
      },
      error: err => {
        this.errorMessage.set(err?.error?.message || "Failed to load history.");
        this.loading.set(false);
      }
    });
}


  // -------------------------------------------------------
  // Format date
  // -------------------------------------------------------
  format(date: string) {
    return new Date(date).toLocaleDateString();
  }
}
