import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-assignment-return',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './assignment-return.component.html',
  styleUrls: ['./assignment-return.component.css']
})
export class AssignmentReturnComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(true);
  assignment = signal<any>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  editForm!: FormGroup;

  returnStatuses = [
    { value: 'AVAILABLE', label: 'Mark Device as Available' },
    { value: 'DAMAGED', label: 'Mark as Damaged' },
    { value: 'MAINTENANCE', label: 'Move to Maintenance' }
  ];

  private assignmentId!: string;

  ngOnInit() {
    this.assignmentId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.assignmentId) {
      this.errorMessage.set("Invalid assignment ID.");
      this.loading.set(false);
      return;
    }

    this.loadAssignment();
  }

  // -------------------------------------------------------
  // Fetch assignment details
  // -------------------------------------------------------
  loadAssignment() {
    this.http.get<any>(`${environment.apiUrl}/assignments/${this.assignmentId}`)
      .subscribe({
        next: (res) => {
          const data = res?.data;
          this.assignment.set(data);
          this.setupForm(data);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set("Failed to load assignment details.");
          this.loading.set(false);
        }
      });
  }

  // -------------------------------------------------------
  // Initialize form with assignment values
  // -------------------------------------------------------
  setupForm(data: any) {
    this.editForm = this.fb.group({
      notes: [data?.notes || ""],
      deviceStatus: ['AVAILABLE']
    });
  }

  // -------------------------------------------------------
  // Submit Return Request
  // -------------------------------------------------------
  submitReturn() {
    if (this.editForm.invalid) return;

    const payload = {
      notes: this.editForm.value.notes,
      deviceStatus: this.editForm.value.deviceStatus
    };

    this.http.post(`${environment.apiUrl}/assignments/${this.assignmentId}/return`, payload)
      .subscribe({
        next: () => {
          this.successMessage.set("Device successfully returned and assignment updated.");
          this.router.navigate(['/assignments']);
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message || "Failed to return device."
          );
        }
      });
  }
}
