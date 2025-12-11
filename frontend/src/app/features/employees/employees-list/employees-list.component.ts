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

  page = signal(1);
  limit = 5;
  totalPages = signal(1);

  loading = signal(true);
  employees = signal<Employee[]>([]);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  searchText = signal('');

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
  this.loading.set(true);

  const params: any = {
    page: this.page(),
    limit: this.limit
  };

  if (this.searchText()) params.search = this.searchText();

  console.log('→ fetchEmployees params:', params); // debug

  this.employeesService.getAll(params).subscribe({
    next: (res) => {
      console.log('← employees response', res); // debug
      // adapt depending on your response shape:
      // if your backend wraps as { status, data: { employees, pagination } }
      const payload = res.data;
      this.employees.set(payload.employees || []);
      this.totalPages.set(payload.pagination?.totalPages || 1);
      this.loading.set(false);
    },
    error: (err) => {
      console.error('fetchEmployees error', err);
      this.errorMessage.set(err?.error?.message || 'Failed to load employees.');
      this.loading.set(false);
    }
  });
}

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

  verifyEmployee(emp: Employee): void {
    if (emp.isVerified) return;

    this.employeesService.resendVerification(emp.email).subscribe({
      next: () => {
        this.successMessage.set(`Verification link sent to ${emp.fullName}'s email.`);
        this.fetchEmployees();   // 👈 FIX
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to send verification email.');
      }
    });
  }

  resendEmail(emp: Employee): void {
    this.employeesService.resendVerification(emp.email).subscribe({
      next: () => {
        this.successMessage.set(`Resent verification email to ${emp.fullName}.`);
        this.fetchEmployees();   // 👈 FIX
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

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update(v => v + 1);
      this.fetchEmployees();
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(v => v - 1);
      this.fetchEmployees();
    }
  }

}
