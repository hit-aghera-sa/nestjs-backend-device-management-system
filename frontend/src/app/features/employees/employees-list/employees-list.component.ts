import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeesService, Employee } from '../../../core/services/employees.service';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.css']
})
export class EmployeesListComponent implements OnInit {

  private employeesService = inject(EmployeesService);
  public router = inject(Router);

  // Pagination
  page = signal(1);
  limit = 5;
  totalPages = signal(1);

  // Filters
  searchText = '';
  status = '';
  department = '';
  verificationStatus = '';

  // State
  loading = signal(true);
  employees = signal<Employee[]>([]);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.loading.set(true);

    const params: any = {
      page: this.page(),
      limit: this.limit
    };

    if (this.searchText) params.search = this.searchText;
    if (this.status) params.status = this.status;
    if (this.department) params.department = this.department;
    if (this.verificationStatus) params.isVerified = this.verificationStatus;

    this.employeesService.getAll(params).subscribe({
      next: (res) => {
        this.employees.set(res.data.employees);
        this.totalPages.set(res.data.pagination.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load employees.');
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    this.page.set(1);
    this.fetchEmployees();
  }

  onFilterChange() {
    this.page.set(1);
    this.fetchEmployees();
  }

  reload() {
    this.fetchEmployees();
  }

  viewEmployee(id: string) {
    this.router.navigate(['/employees/view', id]);
  }

  editEmployee(id: string) {
    this.router.navigate([`/employees/edit/${id}`]);
  }

  verifyEmployee(emp: Employee): void {
    if (emp.isVerified) return;

    this.employeesService.resendVerification(emp.email).subscribe({
      next: () => {
        this.successMessage.set(`Verification link sent to ${emp.fullName}.`);
        this.fetchEmployees();
      },
      error: () => {}
    });
  }

  resendEmail(emp: Employee): void {
    this.employeesService.resendVerification(emp.email).subscribe({
      next: () => {
        this.successMessage.set(`Resent verification email to ${emp.fullName}.`);
        this.fetchEmployees();
      },
      error: () => {}
    });
  }

  deleteEmployee(emp: Employee) {
    this.employeesService.delete(emp._id).subscribe({
      next: () => this.fetchEmployees(),
      error: () => {}
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
      this.page.update(p => p + 1);
      this.fetchEmployees();
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.fetchEmployees();
    }
  }
}
