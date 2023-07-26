import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';


@Component({
  selector: 'app-users-payment-info-dialog',
  template: `
    <h2 mat-dialog-title style="background-color: #004a9f; color: white; padding: 8px 16px;  margin: 0;">Users Payment Info</h2>
    <div mat-dialog-content>
      <app-users-payment-info></app-users-payment-info>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">Close</button>
    </div>
  `,

})
export class UsersPaymentInfoDialogComponent {
  constructor(private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    const paymentbycust = this.data.paymentbycust;
    // Use the paymentbycust data as needed
  }


}
