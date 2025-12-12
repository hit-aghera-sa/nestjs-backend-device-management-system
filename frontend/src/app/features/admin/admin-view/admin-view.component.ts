import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Admin {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'MASTER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  admin = signal<Admin | null>(null);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set("Invalid admin ID.");
      this.loading.set(false);
      return;
    }

    this.fetchAdmin(id);
  }

  // -------------------------------------------------------
  // Convert backend admin → frontend Admin interface
  // -------------------------------------------------------
  private mapAdmin(data: any): Admin {
    return {
      id: data._id || data.id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLogin: data.lastLogin || null,
      status: data.isActive ? 'ACTIVE' : 'INACTIVE'  // backend uses isActive
    };
  }

  // -------------------------------------------------------
  // Load admin details
  // -------------------------------------------------------
  fetchAdmin(id: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.http.get<{ status: string; data: any }>(
      `${environment.apiUrl}/auth/admins/${id}`
    )
    .subscribe({
      next: (res) => {
        this.admin.set(this.mapAdmin(res.data));
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to load admin details.'
        );
        this.loading.set(false);
      }
    });
  }

  // -------------------------------------------------------
  // Navigation helpers
  // -------------------------------------------------------
  goBack(): void {
    this.router.navigate(['/admin-management']);
  }

  editAdmin(): void {
    const id = this.admin()?.id;
    if (id) {
      this.router.navigate([`/admin-management/edit/${id}`]);
    }
  }

  // -------------------------------------------------------
  // Toggle ACTIVE <→ INACTIVE
  // -------------------------------------------------------
  toggleStatus(): void {
    const admin = this.admin();
    if (!admin) return;

    if (admin.role === 'MASTER') {
      this.errorMessage.set("Cannot change status of a MASTER admin.");
      return;
    }

    const endpoint = admin.status === 'ACTIVE'
      ? `${environment.apiUrl}/auth/admins/${admin.id}/deactivate`
      : `${environment.apiUrl}/auth/admins/${admin.id}/activate`;

    this.http.patch<{ status: string; data: any }>(endpoint, {})
      .subscribe({
        next: (res) => {
          // If backend returns null, reload admin
          if (!res.data) {
            this.fetchAdmin(admin.id);
            return;
          }
          this.admin.set(this.mapAdmin(res.data));
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message || 'Failed to update admin status.'
          );
        }
      });
  }

  // -------------------------------------------------------
  // Badge CSS helper
  // -------------------------------------------------------
  getRoleBadge(role: string | undefined) {
    if (!role) return 'bg-gray-100 text-gray-500';
    return role === 'MASTER'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  }
}
