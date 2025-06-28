import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Registration } from '../registration/registration.model';
import { RegistrationService } from '../registration/registration.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, FormControl, PatternValidator } from '@angular/forms';
import { EncrDecrService } from '../shared/EncrDecrService.service';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ConfirmPasswordValidator } from '../shared/confirm-password.validator';
import { customerType } from '../shared/customertype.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MustMatch } from '../_helpers/must-match.validator';
import { HttpClient } from '@angular/common/http';


// Define the regular expression pattern for the password validation
const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;


@Component({
  selector: 'app-registration-dialog',
  templateUrl: './registration-dialog.component.html',
  styleUrls: ['./registration-dialog.component.scss']
})

export class RegistrationDialogComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
  customerTypes: customerType[] = []; // Array to store customer types
  registration: Registration = new Registration;
  errorMessage: string | undefined;
  pageTitle = 'Register';
  public loadedRegistration: Registration | undefined;
  private validationMessages!: { [key: string]: { [key: string]: string } };
  userExistsError: boolean = false;
  custIdExistsError: boolean = false;


  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialogRef: MatDialogRef<RegistrationDialogComponent>, private router: Router, private registrationservice: RegistrationService, @Inject(MAT_DIALOG_DATA) public data: any, private encdecservice: EncrDecrService) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group(
      {
        custTypeId: ['', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        custId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        userName: ['', [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: MustMatch('password', 'confirmPassword'),
      }
    );
    this.loadCustomerTypes();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }
  onlyNumbersValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      const isNumeric = /^\d+$/.test(value);
      return isNumeric ? null : { 'onlyNumbers': true };
    };
  }



  loadCustomerTypes() {
    this.registrationservice.getCustType().subscribe(
      (customerTypes: customerType[]) => {
        this.customerTypes = customerTypes;
        // console.log('Customer Types:', this.customerTypes);
      },
      (error: any) => {
        console.error('Error occurred while fetching customer types:', error);
      }
    );
  }


  onSubmit() {
    this.submitted = true;

    if (this.registerForm.valid) {
      if (this.registerForm.dirty) {
        const p = { ...this.registration, ...this.registerForm.value };
        p.password = this.encdecservice.set('123456$#@$^@1ERF', p.password);
        if (confirm(`You are about creating account for user: ${p.firstName + ' ' + p.lastName}?`)) {
          this.registrationservice.createUser(p).subscribe(
            (data) => {
              // Handle successful registration
              console.log('Registration successful');
              // display form values on success
              alert(
                'SUCCESS!! :-)\n\n' + JSON.stringify(p.firstName, null, 4)
              );
              this.closeDialog();
            },
            (error) => {
              // Handle error
              this.errorMessage = error;
            }
          );
        }
      }
    }




  }

  onReset() {
    this.submitted = false;
    this.registerForm.reset();
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
