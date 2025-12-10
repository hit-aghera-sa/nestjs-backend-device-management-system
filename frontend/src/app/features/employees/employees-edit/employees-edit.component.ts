import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeesService } from '../employees.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-employees-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employees-edit.component.html',
  styleUrls: ['./employees-edit.component.css']
})
export class EmployeesEditComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeesService = inject(EmployeesService);
  private fb = inject(FormBuilder);

  employeeId!: string;

  loading = signal(true);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    department: ['', [Validators.required, Validators.minLength(2)]],
    designation: [''],
    contactNumber: [''],
    status: ['ACTIVE', Validators.required]
  });

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id')!;
    this.loadEmployee();
  }

  loadEmployee() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.employeesService.getById(this.employeeId)
      .subscribe({
        next: (res: any) => {
          const emp = res.data;
          this.form.patchValue({
            fullName: emp.fullName,
            department: emp.department,
            designation: emp.designation,
            contactNumber: emp.contactNumber,
            status: emp.status
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to load employee.');
          this.loading.set(false);
        }
      });
  }

  // -----------------------------
  // Save Changes
  // -----------------------------
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.employeesService.update(this.employeeId, this.form.value)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.successMessage.set('Employee updated successfully.');
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update employee.');
          setTimeout(() => this.errorMessage.set(null), 3000);
        }
      });
  }

  goBack() {
    this.router.navigate(['/employees/view', this.employeeId]);
  }

  get fullName() { return this.form.get('fullName'); }
  get department() { return this.form.get('department'); }
  get designation() { return this.form.get('designation'); }
  get contactNumber() { return this.form.get('contactNumber'); }
  get status() { return this.form.get('status'); }

  hasError(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return c?.touched && c.hasError(err);
  }
}
