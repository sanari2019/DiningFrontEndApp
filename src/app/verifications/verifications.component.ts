import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnlinePaymentService } from '../shared/onlinepayment.service';
import { Transactioning } from './transactioning.model';
import { VoucherService } from '../voucher/voucher.service';
import { Voucher } from '../voucher/voucher.model';

@Component({
  selector: 'app-verifications',
  templateUrl: './verifications.component.html',
  styleUrls: ['./verifications.component.scss']
})
export class VerificationsComponent implements OnInit {
  transactionForm: FormGroup;
  data: any;
  message!: string;
  button!: string;
  transactioning: Transactioning = new Transactioning();
  vouchers: Voucher[] = [];

  constructor(private formBuilder: FormBuilder, private onlinepaymentService: OnlinePaymentService, private voucherService: VoucherService) {
    this.transactionForm = this.formBuilder.group({
      referenceNumber: ['', Validators.required], // You can add more validators if needed
    });
  }

  ngOnInit(): void {
    this.transactionForm = this.formBuilder.group({
      referenceNumber: ['', Validators.required], // You can add more validators if needed
    });
    this.getvouchers();
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const referenceNumber = this.transactionForm.value.referenceNumber;
      // Perform your verification logic here
    }
  }



  verifysquadTransaction() {
    if (this.transactionForm.valid) {
      const referenceNumber = this.transactionForm.value.referenceNumber;
      this.message = "No payment found";
      this.data = null;
      this.button = "Squad";
      this.onlinepaymentService.verifysquadfTransaction(referenceNumber).subscribe(response => {
        this.data = response;
        this.transactioning.amount = response.data.transaction_amount;
        this.transactioning.status = response.message;
        this.transactioning.reference = response.data.transaction_ref;
        this.transactioning.email = response.data.email;
        this.transactioning.paymentDate = response.data.created_at;
        this.message = "Found";
      })
    }

  }

  verifypaystackTransaction() {
    if (this.transactionForm.valid) {
      const referenceNumber = this.transactionForm.value.referenceNumber;
      this.message = "No payment found"
      this.data = null;
      this.button = "Paystack";
      this.onlinepaymentService.verifypaystackTransaction(referenceNumber).subscribe(response => {
        this.data = response;
        if (this.data !== null) {
          this.message = "Found";
          this.transactioning.amount = response.data.requested_amount / 100;
          this.transactioning.status = response.message;
          this.transactioning.reference = response.data.reference;
          this.transactioning.email = response.data.customer.email;
          this.transactioning.paymentDate = response.data.transaction_date;
        }

      })
    }
  }

  getvouchers() {
    this.voucherService.getVouchers().subscribe(response => {
      this.vouchers = response;
    })
  }
}