import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Admin {
  _id: string;   // ✔ backend returns _id, not id
  fullName: string;
  email: string;
  role: 'ADMIN' | 'MASTER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-admin-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-edit.component.html',
  styleUrls: ['./admin-edit.component.css']
})
export class AdminEditComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  adminId = '';   // ✔ single source of truth for ID
  adminForm!: FormGroup;

  admin = signal<Admin | null>(null);
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  roles = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'MASTER', label: 'Master Admin' }
  ];

  ngOnInit(): void {
    this.adminId = this.route.snapshot.paramMap.get('id') ?? '';

    if (this.adminId) {
      this.fetchAdmin(this.adminId);
    }
  }

  fetchAdmin(id: string): void {
    this.loading.set(true);

    this.http.get<{ status: string; data: Admin }>(`${environment.apiUrl}/auth/admins/${id}`)
      .subscribe({
        next: (res) => {
          this.admin.set(res.data);
          this.prepareForm(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to load admin details.');
          this.loading.set(false);
        }
      });
  }

  prepareForm(data: Admin): void {
    this.adminForm = this.fb.group({
      fullName: [data.fullName, [Validators.required, Validators.minLength(3)]],
      email: [data.email, [Validators.required, Validators.email]],
      role: [data.role, Validators.required]
    });
  }

  submit(): void {
    if (this.adminForm.invalid) return;

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.patch(`${environment.apiUrl}/auth/admins/${this.adminId}`, this.adminForm.value)
      .subscribe({
        next: () => {
          this.saving.set(false);

          // ✅ Instant redirect to admin list
          this.router.navigate(['/admin-management']);
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update admin.');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/admin-management']);
  }
}
