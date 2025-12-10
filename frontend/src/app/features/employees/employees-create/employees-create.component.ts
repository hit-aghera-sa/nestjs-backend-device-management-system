import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeesService, Employee } from '../../../core/services/employees.service';

@Component({
  selector: 'app-employees-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employees-create.component.html',
  styleUrls: ['./employees-create.component.css']
})
export class EmployeesCreateComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private employeesService = inject(EmployeesService);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  employeeForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    department: ['', [Validators.required, Validators.minLength(2)]],
    designation: [''],
    contactNumber: [''],
    status: ['ACTIVE', Validators.required]
  });

    onSubmit() {
    if (this.employeeForm.invalid) {
        this.employeeForm.markAllAsTouched();
        return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: Partial<Employee> = {
        fullName: this.employeeForm.value.fullName ?? '',
        email: this.employeeForm.value.email ?? '',
        department: this.employeeForm.value.department ?? '',
        designation: this.employeeForm.value.designation ?? undefined,
        contactNumber: this.employeeForm.value.contactNumber ?? undefined,
        status: (this.employeeForm.value.status ?? 'ACTIVE') as 'ACTIVE' | 'INACTIVE'
    };


    this.employeesService.create(payload).subscribe({
        next: () => {
            this.loading.set(false);
            this.successMessage.set('Employee created successfully.');
            this.employeeForm.reset({ status: 'ACTIVE' });
            this.router.navigate(['/employees']);
        },
        error: (err) => {
            this.loading.set(false);
            this.errorMessage.set(
                err?.error?.message || 'Failed to create employee. Please try again.'
            );
        }
    });
    }


  goBack() {
    this.router.navigate(['/employees']);
  }

  hasError(control: string, error: string): boolean {
    const c = this.employeeForm.get(control);
    return !!c && c.touched && c.hasError(error);
  }
}
