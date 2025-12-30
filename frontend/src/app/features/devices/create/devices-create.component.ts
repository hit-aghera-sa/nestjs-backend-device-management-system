// src/app/features/devices/create/device-create.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeviceService } from '../../../core/services/device.service';

@Component({
  selector: 'app-device-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './devices-create.component.html',
  styleUrls: ['./devices-create.component.css']
})
export class DeviceCreateComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private deviceService = inject(DeviceService);

  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

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

  deviceForm: FormGroup = this.fb.group({
    deviceName: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', [Validators.required]],
    brand: [''],
    modelNumber: [''],
    serialNumber: ['', [Validators.required, Validators.minLength(2)]],
    purchasePrice: [null],
    purchaseDate: [null],
    warrantyExpiry: [null],
    specifications: ['']
  });

  // Submit form
  onSubmit() {
    if (this.deviceForm.invalid) {
      this.deviceForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.deviceService.createDevice(this.deviceForm.value)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('Device created successfully!');
          this.deviceForm.reset();
          this.router.navigate(['/devices']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(
            err?.error?.message || 'Failed to create device. Try again.'
          );
        }
      });
  }

  // Helper
  hasError(control: string, error: string) {
    const c = this.deviceForm.get(control);
    return c?.touched && c?.hasError(error);
  }
}
