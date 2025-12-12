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

  // -------------------------------------------------------
  // Map backend admin → frontend Admin interface
  // -------------------------------------------------------
  private mapAdmin(item: any): Admin {
    return {
      _id: item._id,
      fullName: item.fullName,
      email: item.email,
      role: item.role,
      createdAt: item.createdAt,
      lastLogin: item.lastLogin,
      status: item.isActive ? 'ACTIVE' : 'INACTIVE'
    };
  }

  // -------------------------------------------------------
  // LOAD ALL ADMINS
  // -------------------------------------------------------
  fetchAdmins(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.http.get<{ status: string; data: any[] }>(
      `${environment.apiUrl}/auth/admins`
    )
    .subscribe({
      next: (response) => {
        const mapped = response.data.map(a => this.mapAdmin(a));
        this.admins.set(mapped);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'Failed to load admin list. Please try again.'
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

  // -------------------------------------------------------
  // ACTIVATE / DEACTIVATE ADMIN
  // -------------------------------------------------------
  toggleStatus(admin: Admin): void {
    if (admin.role === 'MASTER') {
      alert("MASTER admin status cannot be changed.");
      return;
    }

    const confirmMsg =
      admin.status === 'ACTIVE'
        ? `Deactivate ${admin.fullName}?`
        : `Activate ${admin.fullName}?`;

    if (!confirm(confirmMsg)) return;

    const endpoint =
      admin.status === 'ACTIVE'
        ? `${environment.apiUrl}/auth/admins/${admin._id}/deactivate`
        : `${environment.apiUrl}/auth/admins/${admin._id}/activate`;

    this.http.patch<{ status: string; data: any }>(endpoint, {})
      .subscribe({
        next: (res) => {
          const updated = this.mapAdmin(res.data);

          const newList = this.admins().map(a =>
            a._id === admin._id ? updated : a
          );

          this.admins.set(newList);
        },
        error: (error) => {
          alert(error?.error?.message || 'Failed to update status.');
        }
      });
  }

  // -------------------------------------------------------
  // Badge Helpers
  // -------------------------------------------------------
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
