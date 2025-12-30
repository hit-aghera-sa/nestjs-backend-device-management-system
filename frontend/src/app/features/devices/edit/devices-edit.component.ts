// src/app/features/devices/edit/device-edit.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceService } from '../../../core/services/device.service';

@Component({
  selector: 'app-device-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './devices-edit.component.html',
  styleUrls: ['./devices-edit.component.css']
})
export class DeviceEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private deviceService = inject(DeviceService);

  deviceId = '';
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  categories = [
    'laptop',
    'monitor',
    'keyboard',
    'mouse',
    'mobile',
    'tablet',
    'headphone',
    'printer',
    'other'
  ];

  // 🔹 Allowed statuses (same as backend)
  statuses = [
    'AVAILABLE',
    'DAMAGED',
    'MAINTENANCE'
  ];

  // 🔹 status added here
  deviceForm: FormGroup = this.fb.group({
    deviceName: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', [Validators.required]],
    status: ['', [Validators.required]],
    brand: [''],
    modelNumber: [''],
    serialNumber: ['', [Validators.required, Validators.minLength(2)]],
    purchasePrice: [null],
    purchaseDate: [null],
    warrantyExpiry: [null],
    specifications: ['']
  });

  ngOnInit(): void {
    this.deviceId = this.route.snapshot.params['id'];
    this.loadDevice();
  }

  loadDevice() {
    this.loading.set(true);

    this.deviceService.getDeviceById(this.deviceId).subscribe({
      next: (res) => {
        const d = res.data;

        // 🔹 status patched here
        this.deviceForm.patchValue({
          deviceName: d.deviceName,
          category: d.category,
          status: d.status,
          brand: d.brand,
          modelNumber: d.modelNumber,
          serialNumber: d.serialNumber,
          purchasePrice: d.purchasePrice,
          purchaseDate: d.purchaseDate ? d.purchaseDate.substring(0, 10) : null,
          warrantyExpiry: d.warrantyExpiry ? d.warrantyExpiry.substring(0, 10) : null,
          specifications: d.specifications
        });

        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load device.');
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.deviceForm.invalid) {
      this.deviceForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // 🔹 status included automatically because it's in the form
    const payload = {
      ...this.deviceForm.value,
      purchasePrice: this.deviceForm.value.purchasePrice
        ? Number(this.deviceForm.value.purchasePrice)
        : null,
    };

    this.deviceService.updateDevice(this.deviceId, payload)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.successMessage.set('Device updated successfully.');
          this.router.navigate(['/devices']);
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(
            err?.error?.message || 'Failed to update device.'
          );
        }
      });
  }

  hasError(control: string, error: string) {
    const c = this.deviceForm.get(control);
    return c?.touched && c?.hasError(error);
  }
}
