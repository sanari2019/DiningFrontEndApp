import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RegistrationService } from '../registration/registration.service';
import { Registration } from '../registration/registration.model';
import { EncrDecrService } from '../shared/EncrDecrService.service';

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
  loadedRegistration: Registration | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private registrationservice: RegistrationService,
    private encdecservice: EncrDecrService
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

    if (this.forgotPasswordForm.valid) {
      if (this.forgotPasswordForm.dirty) {
        const { username, newPassword } = this.forgotPasswordForm.value;

        // Check if the username exists in the database
        this.registrationservice.getUserbyusername(username)
          .subscribe(
            (result: Registration) => {
              this.loadedRegistration = result;

              if (this.loadedRegistration !== null) {
                // Update the user's password
                const updatedUser: Registration = {
                  ...this.loadedRegistration,
                  password: this.encdecservice.set('123456$#@$^@1ERF', newPassword)
                };

                this.registrationservice.updateUser(updatedUser)
                  .subscribe(
                    () => this.onPasswordResetSuccess(),
                    (error: any) => this.onPasswordResetError(error)
                  );
              } else {
                this.errorMessage = `Username '${username}' does not exist.`;
              }
            },
            (error: any) => this.onPasswordResetError(error)
          );
      } else {
        this.errorMessage = 'Please enter your username and new password.';
      }
    } else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

  onPasswordResetSuccess(): void {
    this.successMessage = 'Your password has been successfully reset.';
    this.forgotPasswordForm.reset();
  }

  goBack(): void {
    // Redirect to the login page
    window.location.href = '../login';
  }
  

  onPasswordResetError(error: any): void {
    this.errorMessage = 'Failed to reset the password. Please try again.';
    console.error(error);
  }
}
