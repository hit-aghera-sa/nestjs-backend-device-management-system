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

  private deviceService = inject(DeviceService);   // ✅ FIXED
  public router = inject(Router);

  // -------- Pagination --------
  page = signal(1);
  limit = 5;
  totalPages = signal(1);

  loading = signal(true);
  errorMessage = signal<string | null>(null);
  devices = signal<Device[]>([]);
  searchText = signal("");

  ngOnInit(): void {
    this.fetchDevices();
  }

  fetchDevices(): void {
    this.loading.set(true);

    const params: any = {
      page: this.page(),
      limit: this.limit
    };

    if (this.searchText()) params.search = this.searchText();

    this.deviceService.getDevices(params).subscribe({
      next: (res: { status: string; data: any }) => {   // ✅ typed
        this.devices.set(res.data.devices);
        this.totalPages.set(res.data.pagination.totalPages);
        this.loading.set(false);
      },
      error: (err: any) => {   // ✅ typed
        this.errorMessage.set(err?.error?.message || 'Failed to load devices');
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.page.set(1);
    this.fetchDevices();
  }

  viewDevice(id: string): void {
    this.router.navigate([`/devices/view/${id}`]);
  }

  editDevice(id: string): void {
    this.router.navigate([`/devices/edit/${id}`]);
  }

  deleteDevice(device: Device): void {
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
