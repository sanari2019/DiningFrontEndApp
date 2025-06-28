import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OnlinePaymentService } from '../shared/onlinepayment.service';

@Component({
  selector: 'app-squad-payment-dialog',
  templateUrl: './squad-payment-dialog.component.html',
  styleUrls: ['./squad-payment-dialog.component.scss']
})
export class SquadPaymentDialogComponent implements OnInit {
  paymentContent: string | null = null;
  isLoading: boolean = true;

  constructor(
    public onlinepaymentService: OnlinePaymentService,
    public dialogRef: MatDialogRef<SquadPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router) { }

  redirectToPayment() {
    if (this.data && this.data.paymentUrl) {
      // Navigate to the payment URL
      this.router.navigateByUrl(this.data.paymentUrl);
    }
  }
  ngOnInit(): void {
    // this.redirectToPayment();
    // Assuming you have the logic to get the paymentUrl
    // const paymentUrl = this.getPaymentUrl();

    // Fetch payment content
    this.onlinepaymentService.fetchPaymentContent(this.data.paymentUrl)
      .subscribe(
        (data: any) => {
          this.paymentContent = data;
          this.isLoading = false;
        },
        error => {
          console.error('Error loading URL:', error);
          this.isLoading = false; // Update loading state even on error
        }
      );
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
