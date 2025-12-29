import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';
import { LoggingService } from '../../core/services/logging.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  private router = inject(Router);
  private auth = inject(AuthService);
  private dashboard = inject(DashboardService);
  private http = inject(HttpClient);  
  private log = inject(LoggingService);

  today = new Date();
  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);
  currentRoute = signal<string>(this.router.url);

  stats = signal<any>(null);
  user = signal<any>(null);
  activeAssignments = signal(0);
  lowStockCount = signal(0);            

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.urlAfterRedirects);
        this.updatePageTitle(event.urlAfterRedirects);
      });

    this.updatePageTitle(this.router.url);

    effect(() => { });
  }

  ngOnInit() {
    this.initializeSidebarControls();
    this.loadStats();
    this.loadUserInfo();
    this.loadLowStock();         
    this.loadActiveAssignments();
  }

  // -------------------------------
  // Load Dashboard Stats
  // -------------------------------
  loadStats() {
    this.dashboard.getOverview().subscribe({
      next: (res: any) => {
        const d = res.data;

        this.stats.set({
          totalDevices: d.devices.total,
          assignedDevices: d.devices.assigned,
          availableDevices: d.devices.available,
          damagedDevices: d.devices.damaged,
          maintenanceDevices: d.devices.maintenance,
          totalEmployees: d.employees.total
        });
      },
      error: (err) => this.log.error("Dashboard stats error:", err)
    });
  }

  loadActiveAssignments() {
    this.dashboard.getActiveAssignments().subscribe({
      next: (res) => {
        this.activeAssignments.set(res?.data?.count ?? 0);
      },
      error: () => this.activeAssignments.set(0)
    });
  }


  // -------------------------------
  // Load Low Stock Count
  // -------------------------------
  loadLowStock() {
    this.http.get<any>(`${environment.apiUrl}/stock/low`)
      .subscribe({
        next: (res) => {
          this.lowStockCount.set(res?.data?.length ?? 0);
        },
        error: () => {
          this.lowStockCount.set(0);
        }
      });
  }

  // -------------------------------
  // Load Logged-in Admin Info
  // -------------------------------
  loadUserInfo() {
    const userFromToken = this.auth.currentUser();
    this.user.set(userFromToken);
  }

  isActiveRoute(route: string) {
    return this.currentRoute().startsWith(route);
  }

  updatePageTitle(route: string) {
    const pageTitle = document.getElementById('page-title');
    if (!pageTitle) return;

    const map: any = {
      '/dashboard': 'Dashboard Overview',
      '/employees': 'Employees',
      '/devices': 'Devices',
      '/assignments': 'Assignments',
      '/stock': 'Stock Overview',
      '/profile': 'Admin Profile'
    };

    const match = Object.keys(map).find(key => route.startsWith(key));
    pageTitle.textContent = match ? map[match] : 'Dashboard';
  }

  initializeSidebarControls() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapse-btn');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');

    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        if (!sidebar) return;
        this.sidebarCollapsed.set(!this.sidebarCollapsed());
        sidebar.classList.toggle('collapsed', this.sidebarCollapsed());
      });
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        this.mobileSidebarOpen.set(true);
        mobileSidebar?.classList.add('open');
        overlay?.classList.add('open');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        this.mobileSidebarOpen.set(false);
        mobileSidebar?.classList.remove('open');
        overlay?.classList.remove('open');
      });
    }
  }

  getInitials(): string {
    const u = this.user();
    if (!u || !u.fullName) return 'AD';

    return u.fullName
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase();
  }

  go(route: string) {
    this.router.navigate([route]);
    this.mobileSidebarOpen.set(false);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
