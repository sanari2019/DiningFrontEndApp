import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Registration } from '../registration/registration.model';
import { RegistrationService } from '../registration/registration.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl, ValidatorFn, FormControl, PatternValidator } from '@angular/forms';
import { EncrDecrService } from '../shared/EncrDecrService.service';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ConfirmPasswordValidator } from '../shared/confirm-password.validator';
import { customerType } from '../shared/customertype.model';
import { MatSnackBar } from '@angular/material/snack-bar';


// Define the regular expression pattern for the password validation
const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;


@Component({
  selector: 'app-registration-dialog',
  templateUrl: './registration-dialog.component.html',
  styleUrls: ['./registration-dialog.component.scss']
})

export class RegistrationDialogComponent implements OnInit {
  selectedOption: string = 'default';

  registrationForm!: UntypedFormGroup;
  customerTypes: customerType[] = []; // Array to store customer types
  registration: Registration = new Registration;
  errorMessage: string | undefined;
  pageTitle = 'Register';
  submitted: boolean = false;
  public loadedRegistration: Registration | undefined;
  private validationMessages: { [key: string]: { [key: string]: string } };


  constructor(private snackBar: MatSnackBar, private fb: UntypedFormBuilder, public dialogRef: MatDialogRef<RegistrationDialogComponent>, private router: Router, private registrationservice: RegistrationService, @Inject(MAT_DIALOG_DATA) public data: any, private encdecservice: EncrDecrService) {
    this.validationMessages = {
      firstName: {
        required: 'first name is required.',
        minlength: 'First name must be at least three characters.'
      },
      lastName: {
        required: 'last name is required.'
      },
      email: {
        required: 'user name is required.'
      },
      password: {
        required: 'Password is required.'
      },

    };
  }

  userExistsError: boolean = false;
  custIdExistsError: boolean = false;

  ngOnInit() {
    this.registrationForm = this.fb.group({
      custTypeId: [0, Validators.required],
      custId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      firstName: ['', Validators.minLength(3)],
      lastName: ['', Validators.maxLength(50)],
      userName: ['', [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d-()\s]*$/)]],
      password: ['', [Validators.required, Validators.pattern(passwordRegex)]],
      confirmPassword: ['', Validators.required]
    },
      {
        validator: ConfirmPasswordValidator("password", "confirmPassword")
      }
    );
    this.loadCustomerTypes();
  }
  get regEmail() {
    return this.registrationForm.get('userName')
  }
  // Method to handle the input event for the custId input field
  onCustIdInput() {
    const custIdControl = this.registrationForm.get('custId');
    if (custIdControl) {
      const inputValue = custIdControl.value;
      if (inputValue !== null) {
        const stringValue = inputValue.toString();
        custIdControl.setValue(stringValue, { emitEvent: false });
      }
    }
  }



  // Custom validator to check for only numbers
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
  getCustomerTypes(): string[] {
    return ['staff', 'outsourced', 'guest'];
  }

  //   setPatternValidator(){
  //     this.registrationForm.get('email')?.setValidators(Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"));  
  // }
  // emailValidator(control: { value: string; }) {
  //   if (control.value) {
  //     const matches = control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
  //     return matches ? null : { 'invalidEmail': true };
  //   } else {
  //     return null;
  //   }
  // }
  // save(): void {
  //   this.submitted = true;

  //   if (this.registrationForm.valid) {
  //     if (this.registrationForm.dirty) {
  //       const p = { ...this.registration, ...this.registrationForm.value };
  //       p.password = this.encdecservice.set('123456$#@$^@1ERF', p.password);
  //       if (p.userName !== "") {
  //         this.registrationservice.getUserbyusername(p.userName)
  //           .subscribe((rslt: Registration) => {
  //             this.loadedRegistration = rslt;
  //             if (this.loadedRegistration == null) {
  //               if (p.id === 0) {
  //                 if (confirm(`You are about creating account for user: ${p.firstName + ' ' + p.lastName}?`)) {
  //                   this.registrationservice.createUser(p)
  //                     .subscribe({
  //                       next: () => this.onSaveComplete(),
  //                       error: err => this.errorMessage = err
  //                     });
  //                   this.dialogRef.close();
  //                 }
  //                 // Display a snackbar with the "Payment Successful" message
  //                 this.snackBar.open('Registration Successful', 'Dismiss', {
  //                   duration: 3000, // 3 seconds duration for the snackbar
  //                 });
  //               }
  //             } else {
  //               console.log("User Exist")
  //               this.userExistsError = true;
  //             }
  //           }
  //           )

  //       }
  //       else {
  //         console.log("User Exists")
  //         this.onSaveComplete();
  //       }

  //     }
  //     else {
  //       this.errorMessage = 'Please correct the validation errors.';
  //     }

  //   }

  // }


  save(): void {
    this.submitted = true;

    if (this.registrationForm.valid) {
      if (this.registrationForm.dirty) {
        const p = { ...this.registration, ...this.registrationForm.value };
        p.password = this.encdecservice.set('123456$#@$^@1ERF', p.password);

        if (p.userName !== "") {
          this.registrationservice.getUserbyusername(p.userName).subscribe((rslt: Registration) => {
            this.loadedRegistration = rslt;
            if (this.loadedRegistration == null) {
              this.checkCustIdAndProceed(p); // Check custId after checking userName
              this.dialogRef.close();
            } else {
              console.log("User Exist")
              this.userExistsError = true;
            }
          });
        } else {
          this.checkCustIdAndProceed(p); // Check custId when userName is empty
          this.dialogRef.close();
        }
      } else {
        this.errorMessage = 'Please correct the validation errors.';
      }
    }
  }

  private checkCustIdAndProceed(p: any): void {
    if (p.custId !== "") {
      this.registrationservice.getUserByCustId(p.custId).subscribe((rslt: Registration) => {
        this.loadedRegistration = rslt;
        if (this.loadedRegistration == null) {
          if (p.id === 0) {
            if (confirm(`You are about creating an account for user: ${p.firstName + ' ' + p.lastName}?`)) {
              this.registrationservice.createUser(p).subscribe({
                next: () => this.onSaveComplete(),
                error: err => this.errorMessage = err
              });

              this.snackBar.open('Registration Successful', 'Dismiss', {
                duration: 3000,
              });

            } else {
              this.snackBar.open('Registration Not Successful', 'Dismiss', {
                duration: 4000,
              });
            }

          } else {
            this.snackBar.open('User id exists', 'Dismiss', {
              duration: 4000,
            });
          }
        } else {
          console.log("CustId Exists")
          this.custIdExistsError = true;
        }
      });
    } else {
      console.log("CustId Exists")
      this.onSaveComplete();
    }
  }


  getUser(username: string): Registration {
    this.registrationservice.getUserbyusername(username)
      .subscribe({
        next: (registration: Registration) => this.registration,
        error: err => this.errorMessage = err
      });
    return this.registration
  }



  onSaveComplete(): void {
    // this.registrationForm.reset();
    // this.router.navigate(['/registrations']);
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
