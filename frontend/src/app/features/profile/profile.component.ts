import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);

  loading = signal(true);
  savingProfile = signal(false);
  savingPassword = signal(false);

  user = signal<any>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]]
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);

    const current = this.auth.currentUser();

    if (!current) {
      this.errorMessage.set('User not found. Please login again.');
      this.loading.set(false);
      return;
    }

    this.user.set(current);

    this.profileForm.patchValue({
      fullName: current.fullName,
      email: current.email
    });

    this.loading.set(false);
  }

  updateProfile() {
  if (this.profileForm.invalid) return;

  this.savingProfile.set(true);
  this.errorMessage.set(null);
  this.successMessage.set(null);

  const payload = {
    fullName: this.profileForm.value.fullName,
    email: this.profileForm.value.email
  };

  this.http.patch(`${environment.apiUrl}/auth/profile`, payload)
    .subscribe({
      next: (res: any) => {
        this.savingProfile.set(false);
        this.successMessage.set('Profile updated successfully.');

        // refresh local state
        const updated = {
          ...this.user(),
          ...payload
        };

        localStorage.setItem('auth_state', JSON.stringify({ user: updated }));
        this.user.set(updated);

        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Failed to update profile.'
        );
      }
    });
}


  changePassword() {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmNewPassword } =
      this.passwordForm.value;

    if (newPassword !== confirmNewPassword) {
      this.errorMessage.set('New password and confirmation do not match.');
      return;
    }

    this.savingPassword.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.patch(`${environment.apiUrl}/auth/change-password`, {
      oldPassword: currentPassword,
      newPassword
    }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.successMessage.set('Password updated successfully.');

        this.auth.logout();

        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { msg: 'Password updated. Please log in again.' }
          });
        }, 1200);

        this.passwordForm.reset();
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Failed to update password.'
        );
      }
    });
  }
}
