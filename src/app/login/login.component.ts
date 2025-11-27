import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthNewService } from './../auth/auth-new.service';
import { AuthService } from './../auth/auth.service';
import { RegistrationDialogComponent } from '../registration-dialog/registration-dialog.component';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  form!: FormGroup;
  private formSubmitAttempt = false;
  loginMessage = '';
  isLoading = false;
  private loginSubscription: Subscription | undefined;
  appVersion: string = environment.version;
  currentYear: number = new Date().getFullYear();

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private authNewService: AuthNewService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Clear any existing session
    localStorage.clear();

    // Initialize login form
    this.form = this.fb.group({
      userName: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  isFieldInvalid(field: string) {
    return (
      (!this.form.get(field)?.valid && this.form.get(field)?.touched) ||
      (this.form.get(field)?.untouched && this.formSubmitAttempt)
    );
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(RegistrationDialogComponent, {
      width: '85%',
      // data: { orderedMeals: this.orderedMeals },
    });

    dialogRef.afterClosed().subscribe(() => {
      //console.log('The dialog was closed');
      // this.ngOnInit();
    });
  }

  onSubmit() {
    this.formSubmitAttempt = true;

    if (this.form.invalid) {
      this.loginMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.loginMessage = '';

    const loginData = {
      userName: this.form.value.userName.toLowerCase().trim(),
      password: this.form.value.password,
      rememberMe: this.form.value.rememberMe || false
    };

    this.loginSubscription = this.authNewService.login(loginData).subscribe({
      next: (result) => {
        if (result.success) {
          this.isLoading = false;
          this.loginMessage = '';

          // Sync user data to legacy AuthService for AppComponent
          const userData = this.authNewService.currentUser;
          if (userData) {
            this.authService.registration = {
              id: userData.id,
              custTypeId: userData.custTypeId,
              custId: userData.custId,
              firstName: userData.firstName,
              lastName: userData.lastName,
              userName: userData.userName,
              password: '',
              freeze: userData.freeze || false,
              autolock: false
            };
            // Trigger the BehaviorSubject to notify AppComponent
            this.authService.notifyLoginSuccess();
          }

          // Show success message
          this.snackBar.open('Login Successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          // Navigate to home page
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 500);
        }
      },
      error: (error) => {
        this.isLoading = false;

        // Handle different error types
        let errorMessage = error.message || 'Login failed. Please try again.';
        let duration = 5000;

        switch (error.errorType) {
          case 'NetworkError':
            errorMessage = 'Cannot connect to server. Please check your connection.';
            duration = 7000;
            break;
          case 'AuthenticationError':
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 'UserNotFoundError':
            errorMessage = 'Account not found. Please check your email address.';
            break;
          case 'DatabaseError':
            errorMessage = 'System error occurred. Please try again later.';
            duration = 7000;
            break;
          case 'AccountFrozenError':
            errorMessage = 'Your account is frozen. Please contact administrator.';
            duration = 10000;
            break;
          case 'ServerError':
            errorMessage = 'Server error. Please try again later.';
            duration = 7000;
            break;
        }

        this.loginMessage = errorMessage;

        this.snackBar.open(errorMessage, 'Close', {
          duration: duration,
          panelClass: ['error-snackbar']
        });

        console.error('Login error:', error);
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe from the login subscription when the component is destroyed to avoid memory leaks.
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}
