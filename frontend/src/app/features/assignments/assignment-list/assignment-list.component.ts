// src/app/features/assignments/assignment-list/assignment-list.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Assignment {
  id: string;
  employee: {
    id: string;
    fullName: string;
    department: string;
  };
  device: {
    id: string;
    deviceName: string;
    model: string;
    serialNumber: string;
  };
  assignedAt: string | null;
  returnedAt?: string | null;
  status: 'ASSIGNED' | 'RETURNED' | string;
  notes?: string;
}

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.css']
})
export class AssignmentListComponent implements OnInit {
  private http = inject(HttpClient);
  public router = inject(Router);

  loading = signal(true);
  assignments = signal<Assignment[]>([]);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchAssignments();
  }

  fetchAssignments(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.http.get<{ status: string; data: any[] }>(`${environment.apiUrl}/assignments`)
      .subscribe({
next: (response) => {
  console.log('API Response:', response);

  if (response && Array.isArray(response.data)) {
    const mappedAssignments = response.data.map((a: any) => ({
      id: a._id,
      employee: {
        id: a.employee?._id,
        fullName: a.employee?.fullName,
        department: a.employee?.department
      },
      device: {
        id: a.device?._id,
        deviceName: a.device?.deviceName,
        model: a.device?.modelNumber,   // backend = modelNumber
        serialNumber: a.device?.serialNumber
      },
      assignedAt: a.assignedAt,
      returnedAt: a.returnedAt,
      status: a.status,
      notes: a.notes
    }));

    console.log("Mapped Assignments:", mappedAssignments);

    this.assignments.set(mappedAssignments);
  } else {
    this.errorMessage.set("Invalid response format from server");
    this.assignments.set([]);
  }

  this.loading.set(false);
},
        error: (error) => {
          console.error('Error fetching assignments:', error);
          this.errorMessage.set(
            error?.error?.message ||
            'Failed to load assignments. Please check your connection and try again.'
          );
          this.assignments.set([]);
          this.loading.set(false);
        }
      });
  }

  reload(): void {
    this.fetchAssignments();
  }

  viewAssignment(id: string): void {
    this.router.navigate([`/assignments/view/${id}`]);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusBadgeClass(status: string): string {
    return status === 'ASSIGNED'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    return status === 'ASSIGNED' ? 'Assigned' : 'Returned';
  }

  deleteAssignment(id: string): void {
    this.loading.set(true);

    this.http.delete(`${environment.apiUrl}/assignments/${id}`)
        .subscribe({
        next: () => {
            // remove deleted row from UI without reload
            const updated = this.assignments().filter(a => a.id !== id);
            this.assignments.set(updated);
            this.loading.set(false);
        },
        error: (error) => {
            console.error("Delete failed:", error);
            this.errorMessage.set(error?.error?.message || "Failed to delete assignment.");
            this.loading.set(false);
        }
        });
    }

}
