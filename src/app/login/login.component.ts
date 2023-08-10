import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from './../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { RegistrationDialogComponent } from '../registration-dialog/registration-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;                    // {1}
  private formSubmitAttempt!: boolean; // {2}
  loginMessage = '';
  notLoggedIn$!: Observable<boolean>;
  private loginSubscription: Subscription | undefined;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder,         // {3}
    private authService: AuthService // {4}
  ) { }

  ngOnInit() {
    this.form = this.fb.group({     // {5}
      userName: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
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
      console.log('The dialog was closed');
      // this.ngOnInit();
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loginSubscription = this.authService.login(this.form.value).subscribe((resultMessage: string) => {
        if (resultMessage === "") {
          if (this.authService.notLoggedIn) {
            this.formSubmitAttempt = true;
          }
          // Successful login, clear loginMessage and show success flash message.
          this.loginMessage = "";
          this.snackBar.open('Login Successful!', 'Close', { duration: 3000 });
        } else {
          // Show error flash message.
          this.loginMessage = resultMessage;
          this.snackBar.open(resultMessage, 'Close', { duration: 3000 });
        }
      });
    }
  }

  ngOnDestroy() {
    // Unsubscribe from the login subscription when the component is destroyed to avoid memory leaks.
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}
