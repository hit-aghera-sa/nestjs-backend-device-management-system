import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private router = inject(Router);

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

    this.http.get<{ status: string; data: any }>(`${environment.apiUrl}/auth/me`)
      .subscribe({
        next: (res) => {
          this.user.set(res.data);
          this.profileForm.patchValue({
            fullName: res.data.fullName,
            email: res.data.email
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to load profile.');
          this.loading.set(false);
        }
      });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.savingProfile.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.http.patch(`${environment.apiUrl}/auth/update`, this.profileForm.value)
      .subscribe({
        next: () => {
          this.savingProfile.set(false);
          this.successMessage.set('Profile updated successfully.');
          this.loadProfile();
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => {
          this.savingProfile.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update profile.');
        }
      });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;

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
    })
    .subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.successMessage.set('Password updated successfully.');

        // 🔥 SECURITY BEST PRACTICE → Logout user immediately
        localStorage.removeItem('auth_state');

        // Redirect to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { msg: 'Password updated. Please log in again.' }
          });
        }, 1500);

        this.passwordForm.reset();
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to update password.');
      }
    });
  }
}
