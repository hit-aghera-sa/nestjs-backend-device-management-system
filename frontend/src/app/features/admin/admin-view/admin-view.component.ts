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
    if (id) {
      this.fetchAdmin(id);
    }
  }

  // Helper: Map backend object to frontend Admin interface
  private mapAdmin(data: any): Admin {
    return {
      id: data.id || data._id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLogin: data.lastLogin,
      status: data.isActive ? 'ACTIVE' : 'INACTIVE'  // <-- IMPORTANT FIX
    };
  }

  fetchAdmin(id: string): void {
    this.loading.set(true);
    this.http.get<{ status: string; data: any }>(`${environment.apiUrl}/auth/admins/${id}`)
      .subscribe({
        next: (res) => {
          const mapped = this.mapAdmin(res.data);
          this.admin.set(mapped);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to load admin details.');
          this.loading.set(false);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/admin-management']);
  }

  editAdmin(): void {
    if (this.admin()?.id) {
      this.router.navigate([`/admin-management/edit/${this.admin()?.id}`]);
    }
  }

  toggleStatus(): void {
    const a = this.admin();
    if (!a) return;

    if (a.role === 'MASTER') {
      this.errorMessage.set("Cannot change status of MASTER admin.");
      return;
    }

    const endpoint = a.status === 'ACTIVE'
      ? `${environment.apiUrl}/auth/admins/${a.id}/deactivate`
      : `${environment.apiUrl}/auth/admins/${a.id}/activate`;

    this.http.patch<{ status: string; data: any }>(endpoint, {})
      .subscribe({
        next: (res) => {
          // Backend may return null → refetch admin
          if (!res.data) {
            this.fetchAdmin(a.id);
            return;
          }

          const mapped = this.mapAdmin(res.data);
          this.admin.set(mapped);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to update status.');
        }
      });
  }

  getRoleBadge(role: string | undefined) {
    if (!role) return 'bg-gray-100 text-gray-500';
    return role === 'MASTER'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  }
}
