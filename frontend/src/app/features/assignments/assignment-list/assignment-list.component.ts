import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
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
  expectedReturnDate?: string | null;
  returnedAt?: string | null;
  status: 'ASSIGNED' | 'RETURNED' | string;
  notes?: string;
}

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.css'],
})
export class AssignmentListComponent implements OnInit {

  private http = inject(HttpClient);
  public router = inject(Router);

  page = 1;
  limit = 10;
  total = 0;

  loading = signal(true);
  assignments = signal<Assignment[]>([]);
  errorMessage = signal<string | null>(null);

  filters = {
    status: '',
    employee: '',
    category: '',
    startDate: '',
    endDate: '',
    search: '',
  };

  ngOnInit(): void {
    this.fetchAssignments();
  }

  fetchAssignments(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const params: any = {
      page: this.page,
      limit: this.limit,
    };

    if (this.filters.status) params.status = this.filters.status;
    if (this.filters.employee) params.employee = this.filters.employee;
    if (this.filters.category) params.deviceCategory = this.filters.category;
    if (this.filters.startDate) params.startDate = this.filters.startDate;
    if (this.filters.endDate) params.endDate = this.filters.endDate;
    if (this.filters.search) params.search = this.filters.search;

    this.http.get<{
      status: string;
      data: any[];
      total: number;
      page: number;
      limit: number;
    }>(`${environment.apiUrl}/assignments`, { params })
      .subscribe({
        next: (response: any) => {

          const list = response.data?.data || response.data?.assignments || response.data || [];

          this.total = response.data?.total || 0;
          this.page = response.data?.page || 1;
          this.limit = response.data?.limit || 10;

          const mapped = list.map((a: any) => ({
            id: a.id,
            employee: {
              id: a.employee?.id,
              fullName: a.employee?.fullName,
              department: a.employee?.department,
            },
            device: {
              id: a.device?.id,
              deviceName: a.device?.deviceName,
              model: a.device?.modelNumber,
              serialNumber: a.device?.serialNumber,
            },
            assignedAt: a.assignedAt,
            expectedReturnDate: a.expectedReturnDate,
            returnedAt: a.returnedAt,
            status: a.status,
            notes: a.notes,
          }));

          this.assignments.set(mapped);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to load assignments.');
          this.assignments.set([]);
          this.loading.set(false);
        },
      });
  }

  applyFilters() {
    this.page = 1;
    this.fetchAssignments();
  }

  reload() {
    this.fetchAssignments();
  }

  viewAssignment(id: string) {
    this.router.navigate([`/assignments/view/${id}`]);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  // =======================
// DELETE CONFIRM STATES
// =======================
showDeleteConfirm = signal(false);
assignmentToDeleteId: string | null = null;

// Open confirm dialog
confirmDelete(id: string) {
  this.assignmentToDeleteId = id;
  this.showDeleteConfirm.set(true);
}

// Cancel dialog
cancelDelete() {
  this.assignmentToDeleteId = null;
  this.showDeleteConfirm.set(false);
}

// Confirm delete
deleteAssignmentConfirmed() {
  if (!this.assignmentToDeleteId) return;

  this.loading.set(true);

  this.http.delete(`${environment.apiUrl}/assignments/${this.assignmentToDeleteId}`)
    .subscribe({
      next: () => {
        this.assignments.set(
          this.assignments().filter(a => a.id !== this.assignmentToDeleteId)
        );

        this.assignmentToDeleteId = null;
        this.showDeleteConfirm.set(false);
        this.loading.set(false);
      },

      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to delete assignment.');
        this.assignmentToDeleteId = null;
        this.showDeleteConfirm.set(false);
        this.loading.set(false);
      }
    });
}


  totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  nextPage() {
    if (this.page < this.totalPages()) {
      this.page++;
      this.fetchAssignments();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.fetchAssignments();
    }
  }

  openHistory() {
    this.router.navigate(['/assignments/history']);
  }
}