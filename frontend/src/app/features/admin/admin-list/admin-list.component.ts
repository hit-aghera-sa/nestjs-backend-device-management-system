// src/app/features/admin/admin-list/admin-list.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Admin {
  _id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'MASTER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastLogin?: string;
}


@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.css']
})
export class AdminListComponent implements OnInit {
  private http = inject(HttpClient);
  public router = inject(Router);

  loading = signal(true);
  admins = signal<Admin[]>([]);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchAdmins();
  }

  fetchAdmins(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.http.get<{ status: string; data: Admin[] }>(`${environment.apiUrl}/auth/admins`)
      .subscribe({
        next: (response) => {
          this.admins.set(response.data);
          this.loading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message || 
            'Failed to load admin list. Please try again.'
          );
          this.loading.set(false);
        }
      });
  }

  reload(): void {
    this.fetchAdmins();
  }

  viewAdmin(id: string): void {
    this.router.navigate([`/admin-management/view/${id}`]);
  }

  editAdmin(id: string): void {
    this.router.navigate([`/admin-management/edit/${id}`]);
  }

  toggleStatus(admin: Admin): void {
    if (!confirm(`Are you sure you want to ${admin.status === 'ACTIVE' ? 'deactivate' : 'activate'} ${admin.fullName}?`)) {
      return;
    }

    const endpoint = admin.status === 'ACTIVE' 
      ? `${environment.apiUrl}/admin/admins/${admin._id}/deactivate`
      : `${environment.apiUrl}/admin/admins/${admin._id}/activate`;

    this.http.patch<{ status: string; data: Admin }>(endpoint, {})
      .subscribe({
        next: (response) => {
          // Update local state
          const updatedAdmins = this.admins().map(a => 
            a._id === admin._id ? { ...a, status: response.data.status } : a
          );
          this.admins.set(updatedAdmins);
        },
        error: (error) => {
          alert(`Failed to update status: ${error?.error?.message || 'Unknown error'}`);
        }
      });
  }

  getRoleBadgeClass(role: string): string {
    return role === 'MASTER' 
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  }

  getStatusBadgeClass(status: string): string {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }
}