// src/app/features/devices/view/device-view.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../../core/services/device.service';

@Component({
  selector: 'app-device-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devices-view.component.html',
  styleUrls: ['./devices-view.component.css']
})
export class DeviceViewComponent implements OnInit {

  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private deviceService = inject(DeviceService);

  deviceId = '';

  // Main signals
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  device = signal<any>(null);

  // Status update signals (MISSING EARLIER)
  selectedStatus: string = 'AVAILABLE';
  statusLoading = signal(false);
  statusSuccess = signal<string | null>(null);
  statusError = signal<string | null>(null);

  ngOnInit(): void {
    this.deviceId = this.route.snapshot.params['id'];
    this.loadDevice();
  }

  loadDevice() {
    this.loading.set(true);

    this.deviceService.getDeviceById(this.deviceId).subscribe({
      next: (res) => {
        this.device.set(res.data);
        this.selectedStatus = res.data.status; // prefill dropdown
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load device.');
        this.loading.set(false);
      }
    });
  }

  getStatusBadgeClass(status: string) {
    return {
      AVAILABLE: 'bg-green-100 text-green-700',
      ASSIGNED: 'bg-blue-100 text-blue-700',
      DAMAGED: 'bg-red-100 text-red-700',
      MAINTENANCE: 'bg-yellow-100 text-yellow-700'
    }[status];
  }

  goBack() {
    this.router.navigate(['/devices']);
  }

  // ✅ FIXED: Update device status
  updateStatus() {
    this.statusError.set(null);
    this.statusSuccess.set(null);
    this.statusLoading.set(true);

    // Your service method is updateStatus(), not updateDeviceStatus()
    this.deviceService.updateDeviceStatus(this.deviceId, this.selectedStatus)
      .subscribe({
        next: () => {
          this.statusSuccess.set('Device status updated successfully.');
          this.device().status = this.selectedStatus; // instant UI update
          this.statusLoading.set(false);

        },
        error: (err) => {
          this.statusError.set(err?.error?.message || 'Failed to update status.');
          this.statusLoading.set(false);

        }
      });
  }
}
