// src/app/features/admin/admin-create/admin-create.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-create.component.html',
  styleUrls: ['./admin-create.component.css']
})
export class AdminCreateComponent {

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);

  adminForm: FormGroup;

  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  roles = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'MASTER', label: 'Master Admin' }
  ];

  constructor() {
    this.adminForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ADMIN', Validators.required]
    });
  }

  // -------------------------------------------------------
  // SUBMIT FORM → CREATE ADMIN
  // -------------------------------------------------------
  onSubmit(): void {
    if (this.adminForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const payload = this.adminForm.value;

    this.adminService.register(payload)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('Admin created successfully. Verification email sent.');

          // Reset form for fresh entry
          this.adminForm.reset({ role: 'ADMIN' });

          // Redirect to admin list
          this.router.navigate(['/admin-management']);
        },

        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(
            error?.error?.message ||
            error?.message ||
            'Failed to create admin. Please try again.'
          );
        }
      });
  }

  // -------------------------------------------------------
  // UTILITIES
  // -------------------------------------------------------
  private markAllAsTouched(): void {
    Object.values(this.adminForm.controls).forEach(control => control.markAsTouched());
  }

  // -------------------------------------------------------
  // GETTERS FOR TEMPLATE
  // -------------------------------------------------------
  get fullName() { return this.adminForm.get('fullName'); }
  get email() { return this.adminForm.get('email'); }
  get password() { return this.adminForm.get('password'); }
  get role() { return this.adminForm.get('role'); }

  goToCreateAdmin() {
    this.router.navigate(['/admin-management/create']);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.adminForm.get(controlName);
    return control?.touched && control?.hasError(errorName) || false;
  }
}
