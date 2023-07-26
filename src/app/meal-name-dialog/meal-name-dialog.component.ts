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
import { ActivatedRoute, Router } from '@angular/router';
import { AnyCnameRecord } from 'dns';
import { PaymentDetail } from '../users-payment-info/paymentdetail.model';
import { PaymentDetailService } from '../users-payment-info/paymentdetail.service';


@Component({
  selector: 'app-meal-name-dialog',
  templateUrl: './meal-name-dialog.component.html',
  styleUrls: ['./meal-name-dialog.component.scss']
})
export class MealNameDialogComponent implements OnInit {

  orderedMeals: OrderedMeal[] = [];
  // paymentMainId: number;
  payment: Payment = new Payment();




  constructor(
    public dialogRef: MatDialogRef<MealNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private paymentdetailservice: PaymentDetailService,
    private orderedMealService: OrderedMealService,
    private route: ActivatedRoute,

  ) {

    this.payment = data.paymentMain;


  }


  formatWithCommas(value: number | null): string {
    if (value === null) {
      return '';
    }

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatter.format(value);
  }




  ngOnInit(): void {
    // this.paymentMainId = this.payment.id;
    // this.route.queryParams.subscribe((params) => {
    //   var paramvalue = params['orderedMeals'];

    //   if (paramvalue) {
    //     // this.getUser(paramvalue);
    //     // this.pymtMain = JSON.parse(paramvalue);
    //     this.orderedMeals = JSON.parse(paramvalue);

    //   }

    // });


    // this.getOrderedMeals();
    // Retrieve ordered meals by paymentMainId
    this.getOrderedMealsByPaymentMainId(this.payment);

  }


  getOrderedMealsByPaymentMainId(payment: Payment): void {
    this.orderedMealService.getOrderedMealsByPaymentMainId(payment).subscribe(
      (orderedMeals: OrderedMeal[]) => {
        this.orderedMeals = orderedMeals;
        this.payment = payment;
      },
      (error: any) => {
        console.log('Error retrieving ordered meals:', error);
      }
    );
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
    // Apply a 40% discount to the total amount
    return totalAmount * 0.4;
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




