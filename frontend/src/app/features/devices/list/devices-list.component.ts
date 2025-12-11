// src/app/features/devices/list/devices-list.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DeviceService } from '../../../core/services/device.service';

export interface Device {
  _id: string;
  deviceName: string;
  category: string;
  brand?: string;
  modelNumber?: string;
  serialNumber: string;
  purchaseDate?: string;
  purchasePrice?: number;
  status: 'AVAILABLE' | 'ASSIGNED' | 'DAMAGED' | 'MAINTENANCE';
  createdAt: string;
}

@Component({
  selector: 'app-devices-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './devices-list.component.html',
  styleUrls: ['./devices-list.component.css']
})
export class DevicesListComponent implements OnInit {

  private deviceService = inject(DeviceService);
  public router = inject(Router);

  // Pagination
  page = signal(1);
  limit = 5;
  totalPages = signal(1);

  loading = signal(true);
  errorMessage = signal<string | null>(null);
  devices = signal<Device[]>([]);

  // Filters
  searchText = signal("");
  categoryFilter = signal('');
  statusFilter = signal('');
  brandFilter = signal('');

  // Dynamic categories (optional)
  categories = ['laptop', 'moniter', 'tablet', 'keyboard', 'mouse', 'mobile', 'printer', 'headphone'];

  ngOnInit(): void {
    this.fetchDevices();
  }

  // Fetch devices with filters
  fetchDevices(): void {
    this.loading.set(true);

    const params: any = {
      page: this.page(),
      limit: this.limit
    };

    if (this.searchText()) params.search = this.searchText();
    if (this.categoryFilter()) params.category = this.categoryFilter();
    if (this.statusFilter()) params.status = this.statusFilter();
    if (this.brandFilter()) params.search = this.brandFilter();

    this.deviceService.getDevices(params).subscribe({
      next: (res: any) => {
        this.devices.set(res.data.devices);
        this.totalPages.set(res.data.pagination.totalPages);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load devices');
        this.loading.set(false);
      }
    });
  }

  // Apply filters (reset to page 1)
  applyFilters(): void {
    this.page.set(1);
    this.fetchDevices();
  }

  onSearch(): void {
    this.page.set(1);
    this.fetchDevices();
  }

  viewDevice(id: string) {
    this.router.navigate([`/devices/view/${id}`]);
  }

  editDevice(id: string) {
    this.router.navigate([`/devices/edit/${id}`]);
  }

  deleteDevice(device: Device) {
    this.deviceService.deleteDevice(device._id).subscribe({
      next: () => this.fetchDevices(),
      error: (err: any) =>
        alert(err?.error?.message || 'Failed to delete device.')
    });
  }

  getStatusBadgeClass(status: Device['status']): string {
    return {
      AVAILABLE: 'bg-green-100 text-green-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      DAMAGED: 'bg-red-100 text-red-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800'
    }[status];
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update(v => v + 1);
      this.fetchDevices();
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(v => v - 1);
      this.fetchDevices();
    }
  }
}
