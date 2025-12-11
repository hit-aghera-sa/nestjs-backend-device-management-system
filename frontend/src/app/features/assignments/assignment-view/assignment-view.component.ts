import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-assignment-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignment-view.component.html',
  styleUrls: ['./assignment-view.component.css'],
})
export class AssignmentViewComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(true);
  errorMessage = signal<string | null>(null);
  assignment = signal<any>(null);

  ngOnInit(): void {
    this.fetchAssignment();
  }

  fetchAssignment() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Invalid assignment ID');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.http.get(`${environment.apiUrl}/assignments/${id}`).subscribe({
      next: (res: any) => {
        this.assignment.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Failed to load assignment details.'
        );
      },
    });
  }

  back() {
    this.router.navigate(['/assignments']);
  }

  formatDate(date: string) {
    return new Date(date).toLocaleString();
  }
}