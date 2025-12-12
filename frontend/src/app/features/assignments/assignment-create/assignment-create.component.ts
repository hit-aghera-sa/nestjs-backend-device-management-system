// src/app/features/assignments/assignment-create/assignment-create.component.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-assignment-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assignment-create.component.html',
  styleUrls: ['./assignment-create.component.css']
})
export class AssignmentCreateComponent implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  employees = signal<any[]>([]);
  devices = signal<any[]>([]);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  assignmentForm: FormGroup = this.fb.group({
    employee: ['', Validators.required],
    device: ['', Validators.required],
    notes: [''],
    expectedReturnDate: ['']
  });

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAvailableDevices();
  }

  // -------------------------------------------------------
  // Load employees
  // -------------------------------------------------------
  loadEmployees() {
    this.http.get<any>(`${environment.apiUrl}/employees`)
      .subscribe({
        next: (res) => {
          this.employees.set(res?.data || []);
        },
        error: () => {
          this.errorMessage.set("Failed to load employees.");
        }
      });
  }

  // -------------------------------------------------------
  // Load only available devices
  // -------------------------------------------------------
  loadAvailableDevices() {
    this.http.get<any>(`${environment.apiUrl}/devices?status=AVAILABLE`)
      .subscribe({
        next: (res) => {
          // backend returns { data: { devices: [...] } }
          this.devices.set(res?.data?.devices || res?.data || []);
        },
        error: () => {
          this.errorMessage.set("Failed to load available devices.");
        }
      });
  }

  // -------------------------------------------------------
  // Submit assignment creation
  // -------------------------------------------------------
  onSubmit() {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const payload = {
      employeeId: this.assignmentForm.value.employee,
      deviceId: this.assignmentForm.value.device,
      notes: this.assignmentForm.value.notes || "",
      expectedReturnDate: this.assignmentForm.value.expectedReturnDate || null
    };

    this.http.post(`${environment.apiUrl}/assignments`, payload)
      .subscribe({
        next: () => {
          this.successMessage.set("Assignment created successfully!");
          this.assignmentForm.reset();

          setTimeout(() => {
            this.router.navigate(['/assignments']);
          }, 1200);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message || "Failed to create assignment."
          );
        }
      })
      .add(() => this.loading.set(false));
  }
}
