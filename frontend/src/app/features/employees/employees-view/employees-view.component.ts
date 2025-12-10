import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeesService } from '../employees.service';

@Component({
  selector: 'app-employees-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employees-view.component.html',
  styleUrls: ['./employees-view.component.css']
})
export class EmployeesViewComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeesService = inject(EmployeesService);

  loading = signal(true);
  errorMessage = signal<string | null>(null);
  employee = signal<any>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadEmployee(id);
  }

  loadEmployee(id: string) {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.employeesService.getById(id).subscribe({
      next: (res: any) => {
        this.employee.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to load employee details.'
        );
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/employees']);
  }

  editEmployee() {
    const id = this.employee()?._id;
    if (id) this.router.navigate(['/employees/edit', id]);
  }

  getStatusColor(status: string) {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  // ---------------------------------------------------
  // DELETE EMPLOYEE
  // ---------------------------------------------------
  deleteEmployee() {
    const emp = this.employee();
    if (!emp) return;

    const id = emp._id;                   

    if (!confirm(`Delete ${emp.fullName}? This action cannot be undone.`)) return;

    this.employeesService.delete(id).subscribe({
      next: () => this.router.navigate(['/employees']),
      error: (err) =>
        alert(
          err?.error?.message ||
          'Could not delete employee. Ensure no active device assignments exist.'
        )
    });
  }
}
