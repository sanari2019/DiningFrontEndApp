import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RegistrationService } from 'src/app/registration/registration.service';
import { Registration } from 'src/app/registration/registration.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';

@Component({
  selector: 'app-user-validate',
  templateUrl: './user-validate.component.html',
  styleUrls: ['./user-validate.component.scss']
})
export class UserValidateComponent implements OnInit {
  usernamePattern: string;
  qty: number = 0;
  voucher: number = 0;
  users: Registration[] = [];
  user!: Registration;
  isError = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { usernamePattern: string, qty: number, voucher: number },
    public dialogRef: MatDialogRef<UserValidateComponent>,
    private http: HttpClient,
    private envUrl: EnvironmentUrlService,
    private registrationService: RegistrationService
  ) {
    this.usernamePattern = data.usernamePattern;
    this.qty = data.qty;
    this.voucher = data.voucher;
  }

  ngOnInit(): void {

    const params = new HttpParams()
      // .set('sort', sortingField)
      .set('filters', `usernamePattern@=${this.usernamePattern}`)

    const url = `${this.envUrl.urlAddress}/user/getfiltuser?usernamePattern=${this.usernamePattern}`

    // Implement the logic to fetch users based on this.usernamePattern
    this.http.get<Registration[]>(url, { params }).subscribe((users: Registration[]) => {
      this.users = users;
    });
    // this.registrationService.getUserByUsernamePattern(this.usernamePattern).subscribe((users) => {
    //   this.users = users;
    // });
  }

  // confirmTransfer() {
  //   const confirmationMessage = `You're about to transfer ${this.qty} - ${this.voucher}.`;

  //   if (window.confirm(confirmationMessage)) {
  //     // Handle the transfer confirmation and perform the transfer action here.
  //     // You can call your transfer service or perform any necessary actions.
  //     this.dialogRef.close('confirmed');
  //   }
  //   else {
  //     this.dialogRef.close('cancelled');
  //   }
  // }

  selectUser(user: Registration): void {
    localStorage.setItem('r_user', JSON.stringify(user));
    this.dialogRef.close(user);
    // Close the dialog and pass the selected user object
  }



}
