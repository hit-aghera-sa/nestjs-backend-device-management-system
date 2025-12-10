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

  ngOnInit() {
    this.loadAssignment();
  }

  loadAssignment() {
    const id = this.route.snapshot.params['id'];

    this.http.get<any>(`${environment.apiUrl}/assignments/${id}`)
      .subscribe({
        next: (res) => {
          this.assignment.set(res.data);
          this.setupForm(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set("Failed to load assignment details.");
          this.loading.set(false);
        }
      });
  }

  setupForm(data: any) {
    this.editForm = this.fb.group({
      notes: [data.notes || ""],
      deviceStatus: ['AVAILABLE'] // default
    });
  }

  // Submit "RETURN DEVICE"
  submitReturn() {
    if (!this.editForm.valid) return;

    const id = this.route.snapshot.params['id'];

    const payload = {
      notes: this.editForm.value.notes,
      deviceStatus: this.editForm.value.deviceStatus
    };

    this.http.post(`${environment.apiUrl}/assignments/${id}/return`, payload)
      .subscribe({
        next: (res) => {
          this.successMessage.set("Assignment successfully updated & device returned.");
          setTimeout(() => {
            this.router.navigate(['/assignments']);
          }, 1500);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || "Failed to return assignment.");
        }
      });
  }
}