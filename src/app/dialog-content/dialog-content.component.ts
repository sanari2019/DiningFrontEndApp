import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { OrderedMealService } from '../guestpayment/orderedmeal.service';
import { OrderedMeal } from '../guestpayment/orderedmeal.model';

import { Payment } from '../staffpayment/payment.model';
import { PaymentService } from '../staffpayment/payment.service';
import { Registration } from '../registration/registration.model';
import { PaystackOptions } from 'angular4-paystack';
import { HttpClient } from '@angular/common/http';
import { OnlinePayment } from '../shared/onlinepayment.model';
import { OnlinePaymentService } from '../shared/onlinepayment.service';
import { EmailService } from '../shared/email.service';
import { Router } from '@angular/router';
import { AnyCnameRecord } from 'dns';
import { PaymentDetail } from '../users-payment-info/paymentdetail.model';
import { PaymentDetailService } from '../users-payment-info/paymentdetail.service';
import { LoaderService } from '../loader/loader.service';
import { BehaviorSubject, Observable, observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({

  selector: 'app-dialog-content',
  templateUrl: './dialog-content.component.html'


})
export class DialogContentComponent implements OnInit {
  isLoading$: Observable<boolean>;
  reference = '';
  options: PaystackOptions =
    {
      amount: 0, // Prepopulate with the total amount from selected checkboxes
      email: '', // Prepopulate with the user's email
      ref: `${Math.ceil(Math.random() * 10000000000000)}`
    };
  orderedMeals: OrderedMeal[];
  loggedInUser: any;
  paymentDetail: PaymentDetail | undefined;



  constructor(
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DialogContentComponent>,
    private loaderService: LoaderService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private paymentdetailservice: PaymentDetailService,
    private orderedMealService: OrderedMealService,
    private paymentService: PaymentService,
    private httpClient: HttpClient,
    private router: Router,
    private onlinePaymentService: OnlinePaymentService, private emailService: EmailService
  ) {
    this.orderedMeals = data.orderedMeals;
    this.paymentDetail = data;
    this.isLoading$ = this.loaderService.isLoading$;
  }

  formatWithCommas(value: number | null): string {
    if (value === null) {
      return '';
    }

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatter.format(value);
  }


  paymentInit() {
    console.log('Payment initialized');
  }

  async paymentDone(ref: any) {
    // ... Existing code ...

    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

      const payment: OnlinePayment = {
        id: 0, // Update with the appropriate ID
        TransRefNo: this.options.ref.toString(),
        TransDate: new Date(),
        Paidby: loggedInUser.id,
        AmountPaid: this.calculateRemainingAmount()
      };
      // Step 1: Post the current payment object
      const result = await this.onlinePaymentService.postOnlinePayment(payment).toPromise();

      // Step 2: Create a new payment object from all the ordered meals
      const paymentFromOrderedMeals: Payment = {
        id: 0, // Update with the appropriate ID
        enteredBy: this.orderedMeals[0].enteredBy,
        voucherId: 10,
        amount: this.calculateRemainingAmount(),
        paymentType: 2,
        dateEntered: new Date(),
        custCode: this.loggedInUser.custId,
        unit: 1,
        paymentmodeid: 3,
        servedby: '',
        opaymentid: result.id, // Use the ID returned from the onlinePaymentService
        paid: false,
        timepaid: new Date(),
        custtypeid: this.loggedInUser.custTypeId,
        VoucherDescription: '',
        // ... Your existing code for creating paymentFromOrderedMeals ...
      };
      const createdPayment = await this.paymentService.createPayment(paymentFromOrderedMeals).toPromise();

      // Step 3: Update each ordered meal's Submitted property to true
      for (const orderedMeal of this.orderedMeals) {
        orderedMeal.Submitted = true;
        orderedMeal.paymentMainId = createdPayment.id;

        // Update the individual orderedMeal objects in the array
        await this.orderedMealService.updateOrder(orderedMeal).toPromise();
      }

      // Step 4: Update the payment object returned by createPayment
      createdPayment.paid = true;
      createdPayment.timepaid = new Date();
      await this.paymentService.updatePayment(createdPayment).toPromise();

      // Manually update the local orderedMeals array instead of calling ngOnInit()
      this.orderedMeals.forEach(orderedMeal => orderedMeal.Submitted = true);
      this.calculateTotalAmount();
      this.calculateRemainingAmount();

      this.dialogRef.close(); // Close the dialog
      // Display a snackbar with the "Payment Successful" message
      this.snackBar.open('Payment Successful', 'Dismiss', {
        duration: 3000, // 3 seconds duration for the snackbar
      });

    } catch (error) {
      console.error('Payment processing error:', error);
    }
  }


  paymentCancel() {
    this.calculateTotalAmount();
    this.options.ref = `${Math.random() * 10000000000000}`;
    console.log('payment failed');
    // this.options.ref = ref;
  }


  setRandomPaymentRef() {
    this.reference = `${Math.random() * 10000000000000}`;
    this.options.ref = this.reference;
  }






  ngOnInit(): void {
    this.setRandomPaymentRef();
    const loggedInUserData = localStorage.getItem('user');
    if (loggedInUserData) {
      this.loggedInUser = JSON.parse(loggedInUserData);

      this.options.email = this.loggedInUser.userName; // Set the email to the logged-in user's email
      this.options.amount = this.calculateRemainingAmount() * 100; // Set the amount to the remaining amount in kobo (multiply by 100)

    }
    this.getOrderedMeals();

  }



  getOrderedMeals(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userId = JSON.parse(userData).id;
      this.orderedMealService
        .getOrderedMealsByCust(userId)
        .subscribe(
          (orderedMeals: OrderedMeal[]) => {
            this.orderedMeals = orderedMeals;
          },
          (error: any) => {
            console.log('Error retrieving ordered meals:', error);
          }
        );
    } else {
      console.log('User data not found in local storage.');
    }
  }

  calculateTotalAmount(): number {
    // Calculate the sum of all items' amounts in orderedMeals
    return this.orderedMeals.reduce(
      (total, orderedMeal) => total + orderedMeal.amount,
      0
    );
  }

  calculateDiscountAmount(): number {
    const totalAmount = this.calculateTotalAmount();
    // Check if the logged-in user custtypeid is 3
    if (this.loggedInUser.custTypeId === 3) {
      return 0; // If custTypeId is 3, return 0 discount
    } else {
      // Apply a 40% discount to the total amount
      return totalAmount * 0.4;
    }
  }


  calculateRemainingAmount(): number {
    const totalAmount = this.calculateTotalAmount();
    const discountAmount = this.calculateDiscountAmount();
    // Calculate the remaining amount after applying the discount
    return totalAmount - discountAmount;
  }

  makePayment(): void {
    // Implement the logic for making the payment here
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
