import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.currentUser;
  isMaster = computed(() => this.user()?.role === 'MASTER');

  logout() {
    this.auth.logout();
  }
}
