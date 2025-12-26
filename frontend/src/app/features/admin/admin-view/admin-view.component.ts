// src/app/features/admin/admin-view/admin-view.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

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
  private router = inject(Router);
  private adminService = inject(AdminService);

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
  // Map backend → frontend Admin model
  // -------------------------------------------------------
  private mapAdmin(data: any): Admin {
    return {
      id: data.id ?? data._id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLogin: data.lastLogin || null,
      status: data.isActive ? 'ACTIVE' : 'INACTIVE'
    };
  }

  // -------------------------------------------------------
  // Load admin details
  // -------------------------------------------------------
  fetchAdmin(id: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.adminService.getAdminById(id)
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
    if (id) this.router.navigate([`/admin-management/edit/${id}`]);
  }

  // -------------------------------------------------------
  // Badge helper
  // -------------------------------------------------------
  getRoleBadge(role: string | undefined) {
    if (!role) return 'bg-gray-100 text-gray-500';
    return role === 'MASTER'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  }
}
