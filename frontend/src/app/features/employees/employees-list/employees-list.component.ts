import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EmployeesService, Employee } from '../../../core/services/employees.service';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.css']
})
export class EmployeesListComponent implements OnInit {

  private employeesService = inject(EmployeesService);
  public router = inject(Router);

  loading = signal(true);
  employees = signal<Employee[]>([]);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // 🔍 Search text signal
  searchText = signal('');

  ngOnInit(): void {
    this.fetchEmployees();
  }

  // Fetch employees with optional search query
  fetchEmployees(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const params: any = {};
    if (this.searchText()) params.search = this.searchText();

    this.employeesService.getAll(params).subscribe({
      next: (res) => {
        this.employees.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load employees.');
        this.loading.set(false);
      }
    });
  }

  // Triggered on typing in search bar
  onSearch(): void {
    this.fetchEmployees();
  }

  reload(): void {
    this.fetchEmployees();
  }

  viewEmployee(id: string): void {
    this.router.navigate(['/employees/view', id]);
  }

  editEmployee(id: string): void {
    this.router.navigate([`/employees/edit/${id}`]);
  }

  // Send verification email
  verifyEmployee(emp: Employee): void {
    if (emp.isVerified) return;

    this.employeesService.resendVerification(emp.email).subscribe({
      next: () => {
        this.successMessage.set(`Verification link sent to ${emp.fullName}'s email.`);

        // Refresh silently
        this.employeesService.getAll().subscribe({
          next: (res) => this.employees.set(res.data),
          error: () => {}
        });
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to send verification email.');
      }
    });
  }

  // Resend verification email
  resendEmail(emp: Employee): void {
    this.employeesService.resendVerification(emp.email).subscribe({
      next: () => {
        this.successMessage.set(`Resent verification email to ${emp.fullName}.`);

        // Silent refresh
        this.employeesService.getAll().subscribe({
          next: (res) => this.employees.set(res.data),
          error: () => {}
        });
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to resend verification email.');
      }
    });
  }

  deleteEmployee(emp: Employee): void {
    this.employeesService.delete(emp._id).subscribe({
      next: () => {
        this.fetchEmployees();
      },
      error: (err) => {
        console.error("Delete failed:", err);
      }
    });
  }

  getStatusBadge(status: string): string {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  getVerifyBadge(isVerified: boolean): string {
    return isVerified
      ? 'bg-blue-100 text-blue-700'
      : 'bg-yellow-100 text-yellow-700';
  }
}
