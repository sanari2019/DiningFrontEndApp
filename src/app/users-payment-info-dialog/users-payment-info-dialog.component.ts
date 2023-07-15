import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-users-payment-info-dialog',
  template: `
    <h2 mat-dialog-title>Users Payment Info</h2>
    <div mat-dialog-content>
      <app-users-payment-info></app-users-payment-info>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">Close</button>
    </div>
  `
})
export class UsersPaymentInfoDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    const paymentbycust = this.data.paymentbycust;
    // Use the paymentbycust data as needed
  }
}
