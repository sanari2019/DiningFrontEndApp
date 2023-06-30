import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntypedFormGroup,UntypedFormBuilder,AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { UserService } from './user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotpasswordForm!: UntypedFormGroup;
  form: FormGroup;
  submitted: boolean = false;
  userExists: boolean = false;
  isPasswordReset: boolean = false;
  isPasswordMismatch: boolean = false;
  errorMessage: string = '';
  pageTitle: string = 'Forgot Password';

  constructor(
    private fb: UntypedFormBuilder,
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    });
  }

  ngOnInit() {}

  isFieldInvalid(fieldName: string) {
    const control = this.form.get(fieldName);
    return control?.invalid && (control?.touched || control?.dirty);
  }
  

  checkEmail() {
    if (this.form.valid) {
      const email = this.form.get('email')?.value;
      console.log('Email:', email);

      this.userService.checkEmail(email).subscribe((exists: boolean) => {
        console.log('User exists:', exists);
        this.userExists = exists;
      });
    }
  }

  resetPassword() {
    this.submitted = true;
    this.isPasswordMismatch = false;

    if (this.form.invalid) {
      return;
    }

    const newPassword = this.form.value.newPassword;
    const confirmNewPassword = this.form.value.confirmNewPassword;

    if (newPassword !== confirmNewPassword) {
      this.isPasswordMismatch = true;
      return;
    }

    const email = this.form.value.email;

    console.log('Resetting password for email:', email);

    this.userService.updatePassword(email, newPassword).subscribe(
      () => {
        // Password update successful
        // You can redirect to a success page or display a success message
        console.log('Password update successful');
        this.isPasswordReset = true;
        this.errorMessage = '';
      },
      (error: any) => {
        this.errorMessage = 'Error occurred while updating password.';
        console.error('Password update error:', error);
      }
    );
  }
}
