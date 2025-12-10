// src/app/features/stock/stock-list/stock-list.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CategoryStock {
  category: string;
  total: number;
  assigned: number;
  available: number;
  damaged: number;
  maintenance: number;
}

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-list.component.html'
})
export class StockListComponent implements OnInit {
  private http = inject(HttpClient);

  loading = signal(true);
  stock = signal<CategoryStock[]>([]);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.fetchStock();
  }

  fetchStock() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.http.get<{ status: string; data: CategoryStock[] }>(
      `${environment.apiUrl}/dashboard/stats`
    ).subscribe({
      next: (res) => {
        this.stock.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to load stock data'
        );
        this.loading.set(false);
      }
    });
  }

  reload() {
    this.fetchStock();
  }

  getPercent(section: number, total: number): number {
    return total === 0 ? 0 : Math.round((section / total) * 100);
  }
}
