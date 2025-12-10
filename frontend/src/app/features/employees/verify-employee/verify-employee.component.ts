import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-verify-employee',
  standalone: true,
  templateUrl: './verify-employee.component.html',
})
export class VerifyEmployeeComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  loading = signal(true);
  verified = signal(false);
  errorMessage = signal<string | null>(null);
  message = signal<string | null>(null); 

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading.set(false);
      this.errorMessage.set("Verification token missing.");
      return;
    }

    this.verifyToken(token);
  }

  verifyToken(token: string) {
    this.http.get(`${environment.apiUrl}/employees/verify/${token}`).subscribe({
      next: (res: any) => {
        this.loading.set(false);

        if (res.data?.alreadyVerified) {
          this.verified.set(true);
          this.message.set("Your account is already verified.");  // ✅
          return;
        }

        this.verified.set(true);
        this.message.set("Your email has been successfully verified."); // ✅
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || "Verification failed.");
      }
    });
  }
}
