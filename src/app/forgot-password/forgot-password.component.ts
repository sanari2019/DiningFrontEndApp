import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthNewService } from '../auth/auth-new.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  submitted: boolean = false;
  errorMessage: string | undefined;
  successMessage: string | undefined;
  isLoading: boolean = false;
  appVersion: string = environment.version;
  currentYear: number = new Date().getFullYear();
  hide = true;
  hideConfirm = true;

  constructor(
    private formBuilder: FormBuilder,
    private authNewService: AuthNewService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      username: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPasswordControl = formGroup.get('newPassword');
    const confirmPasswordControl = formGroup.get('confirmPassword');
  
    if (newPasswordControl && confirmPasswordControl) {
      const newPassword = newPasswordControl.value;
      const confirmPassword = confirmPasswordControl.value;
  
      if (newPassword !== confirmPassword) {
        confirmPasswordControl.setErrors({ passwordMismatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
    }
  }
  

  resetPassword(): void {
    this.submitted = true;
    this.errorMessage = undefined;
    this.successMessage = undefined;

    if (this.forgotPasswordForm.invalid) {
      this.errorMessage = 'Please correct the validation errors.';
      return;
    }

    this.isLoading = true;
    const { username, newPassword, confirmPassword } = this.forgotPasswordForm.value;

    this.authNewService.resetPassword({ userName: username, newPassword, confirmPassword }).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success) {
          this.successMessage = 'Your password has been successfully reset.';
          this.forgotPasswordForm.reset();
          this.submitted = false;

          // Show success message
          this.snackBar.open('Password reset successful! Redirecting to login...', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (error) => {
        this.isLoading = false;

        // Handle different error types
        let errorMessage = error.message || 'Failed to reset password. Please try again.';
        let duration = 5000;

        switch (error.errorType) {
          case 'NetworkError':
            errorMessage = 'Cannot connect to server. Please check your connection.';
            duration = 7000;
            break;
          case 'UserNotFoundError':
            errorMessage = `Username '${username}' does not exist. Please check your email address.`;
            break;
          case 'ValidationError':
            errorMessage = 'Please provide a valid username and password.';
            break;
          case 'DatabaseError':
            errorMessage = 'System error occurred. Please try again later.';
            duration = 7000;
            break;
          case 'ServerError':
            errorMessage = 'Server error. Please try again later.';
            duration = 7000;
            break;
        }

        this.errorMessage = errorMessage;

        this.snackBar.open(errorMessage, 'Close', {
          duration: duration,
          panelClass: ['error-snackbar']
        });

        console.error('Password reset error:', error);
      }
    });
  }

  goBack(): void {
    // Navigate back to the login page
    this.router.navigate(['/login']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }
}
