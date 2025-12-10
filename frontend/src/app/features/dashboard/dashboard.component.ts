import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  private router = inject(Router);
  private auth = inject(AuthService);
  private dashboard = inject(DashboardService);

  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);
  currentRoute = signal<string>(this.router.url);

  stats = signal<any>(null);     // dashboard metrics
  user = signal<any>(null);      // logged-in admin info

  constructor() {
    // Update active nav and page title on route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.urlAfterRedirects);
        this.updatePageTitle(event.urlAfterRedirects);
      });

    // Initial title update
    this.updatePageTitle(this.router.url);

    effect(() => {
      // console.log("Sidebar collapsed?", this.sidebarCollapsed());
    });
  }

  ngOnInit() {
    this.initializeSidebarControls();
    this.loadStats();
    this.loadUserInfo();
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
      error: (err) => console.error("Dashboard stats error:", err)
    });
  }

  // -------------------------------
  // Load Logged-in Admin Info
  // -------------------------------
  loadUserInfo() {
    const userFromToken = this.auth.getUser();
    this.user.set(userFromToken);
  }

  isActiveRoute(route: string) {
    return this.currentRoute().startsWith(route);
  }

  // -------------------------------
  // Update Page Title
  // -------------------------------
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

  // -------------------------------
  // Sidebar Controls (Desktop + Mobile)
  // -------------------------------
  initializeSidebarControls() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapse-btn');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');

    // Desktop collapse
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        if (!sidebar) return;
        this.sidebarCollapsed.set(!this.sidebarCollapsed());
        sidebar.classList.toggle('collapsed', this.sidebarCollapsed());
      });
    }

    // Mobile open button
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        this.mobileSidebarOpen.set(true);
        mobileSidebar?.classList.add('open');
        overlay?.classList.add('open');
      });
    }

    // Mobile close when overlay clicked
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
    this.mobileSidebarOpen.set(false); // also close mobile sidebar
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  // -------------------------------
  // Logout
  // -------------------------------
  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

}
