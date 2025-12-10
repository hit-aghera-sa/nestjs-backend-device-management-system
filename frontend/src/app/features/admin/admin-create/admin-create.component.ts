import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { routes } from '../../../app.config';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-admin-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-create.component.html',
  styleUrls: ['./admin-create.component.css']
})
export class AdminCreateComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
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

  // onSubmit(): void {
  //   if (this.adminForm.invalid) {
  //     this.markAllAsTouched();
  //     return;
  //   }

  //   this.loading.set(true);
  //   this.successMessage.set(null);
  //   this.errorMessage.set(null);

  //   const formData = this.adminForm.value;

  //   this.http.post(`${environment.apiUrl}/auth/register`, formData).subscribe({
  //     next: () => {
  //       this.loading.set(false);
  //       this.successMessage.set('Admin created successfully. Verification email sent.');
  //       this.adminForm.reset({ role: 'ADMIN' });
  //       this.clearMessagesAfterDelay();
  //     },
  //     error: (error) => {
  //       this.loading.set(false);
  //       this.errorMessage.set(
  //         error?.error?.message || 
  //         error?.message || 
  //         'Failed to create admin. Please try again.'
  //       );
  //       this.clearMessagesAfterDelay();
  //     }
  //   });

  // }

  onSubmit(): void {
  if (this.adminForm.invalid) {
    this.markAllAsTouched();
    return;
  }

  this.loading.set(true);
  this.successMessage.set(null);
  this.errorMessage.set(null);

  const formData = this.adminForm.value;

  this.http.post(`${environment.apiUrl}/auth/register`, formData).subscribe({
    next: () => {
      this.loading.set(false);
      this.successMessage.set('Admin created successfully. Verification email sent.');

      // Reset form
      this.adminForm.reset({ role: 'ADMIN' });

      // ⭐ Redirect to admin list
      this.router.navigate(['/admin-management']);
    },

    error: (error) => {
      this.loading.set(false);
      this.errorMessage.set(
        error?.error?.message || 
        error?.message || 
        'Failed to create admin. Please try again.'
      );
      this.clearMessagesAfterDelay();
    }
  });
}


  private markAllAsTouched(): void {
    Object.values(this.adminForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage.set(null);
      this.errorMessage.set(null);
    }, 5000);
  }

  get fullName() {
    return this.adminForm.get('fullName');
  }

  get email() {
    return this.adminForm.get('email');
  }

  get password() {
    return this.adminForm.get('password');
  }

  get role() {
    return this.adminForm.get('role');
  }

  goToCreateAdmin() {
    this.router.navigate(['/admin-management/create']);
  }


  hasError(controlName: string, errorName: string): boolean {
    const control = this.adminForm.get(controlName);
    return control?.touched && control?.hasError(errorName) || false;
  }
}