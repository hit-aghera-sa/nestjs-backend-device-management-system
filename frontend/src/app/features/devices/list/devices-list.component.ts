// src/app/features/devices/list/devices-list.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
  private http = inject(HttpClient);
  protected router = inject(Router);

  loading = signal(true);
  errorMessage = signal<string | null>(null);
  devices = signal<Device[]>([]);
  searchText = signal('');

  ngOnInit(): void {
    this.fetchDevices();
  }

  

  fetchDevices(): void {
    this.loading.set(true);

    const params: any = {};
    if (this.searchText()) params.search = this.searchText();

    // ✅ FIXED: Correct backend URL “devices”
    this.http
      .get<{ status: string; data: Device[] }>(`${environment.apiUrl}/devices`, { params })
      .subscribe({
        next: (res) => {
          this.devices.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to load devices');
          this.loading.set(false);
        }
      });
  }

  onSearch(): void {
    this.fetchDevices();
  }

  viewDevice(id: string): void {
    this.router.navigate([`/devices/view/${id}`]);
  }

  editDevice(id: string): void {
    this.router.navigate([`/devices/edit/${id}`]);
  }

    deleteDevice(device: Device): void {
    this.http
        .delete(`${environment.apiUrl}/devices/${device._id}`)
        .subscribe({
        next: () => {
            // Remove item instantly from UI
            this.devices.set(this.devices().filter(d => d._id !== device._id));
        },
        error: (err) => {
            alert(err?.error?.message || 'Failed to delete device.');
        }
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
}
