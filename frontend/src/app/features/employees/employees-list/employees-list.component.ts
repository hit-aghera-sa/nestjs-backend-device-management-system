import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EmployeesService, Employee } from '../employees.service';

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

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.employeesService.getAll().subscribe({
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

  reload(): void {
    this.fetchEmployees();
  }

  viewEmployee(id: string): void {
    this.router.navigate(['/employees/view', id]);
    console.log("object");
  }

  editEmployee(id: string): void {
    this.router.navigate([`/employees/edit/${id}`]);
  }

  verifyEmployee(emp: Employee): void {
    if (emp.isVerified) return;

    if (!confirm(`Send verification email to ${emp.fullName}?`)) return;

    this.employeesService.resendVerification(emp.email).subscribe({
      next: () => {
        alert('Verification email sent successfully!');
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to send verification email.');
      }
    });
  }

  resendEmail(emp: Employee) {
    if (!confirm(`Resend verification email to ${emp.fullName}?`)) return;

    this.employeesService.resendVerification(emp.email).subscribe({
      next: () => {
        alert("Verification email sent successfully!");
      },
      error: (err) => {
        alert(err?.error?.message || "Failed to send verification email.");
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

  resend(email: string) {
    if (!confirm(`Resend verification email to ${email}?`)) return;

    this.employeesService.resendVerification(email).subscribe({
      next: () => {
        alert("Verification email resent successfully!");
      },
      error: (err) => {
        alert(err?.error?.message || "Failed to resend verification email.");
      }
    });
  }

  deleteEmployee(emp: Employee) {
    this.employeesService.delete(emp._id).subscribe({
      next: () => {
        this.fetchEmployees(); 
      },
      error: err => {
        console.error("Delete failed:", err);
      }
    });
  }

}
