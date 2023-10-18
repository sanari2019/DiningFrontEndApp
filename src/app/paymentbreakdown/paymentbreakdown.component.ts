import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentDetailComponent } from '../payment-detail/payment-detail.component';
import { PaymentByCust } from '../users-payment-info/PaymentByCust.model';
import { PaymentDetail } from '../users-payment-info/paymentdetail.model';
import { PaymentDetailService } from '../users-payment-info/paymentdetail.service';
import { Payment } from '../staffpayment/payment.model';
import { Served } from '../users-payment-info/served.model';
import { PaymentService } from '../staffpayment/payment.service';
import { ServedService } from '../users-payment-info/served.service';
import { Registration } from '../registration/registration.model';
import { RegistrationService } from '../registration/registration.service';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';
import { MealNameDialogComponent } from '../meal-name-dialog/meal-name-dialog.component';
import { OrderedMeal } from '../guestpayment/orderedmeal.model';
import { Menu } from '../guestpayment/menu.model';
import { MenuService } from '../guestpayment/menu.service';
import { OrderedMealService } from '../guestpayment/orderedmeal.service';
import { GuestpaymentComponent } from '../guestpayment/guestpayment.component';

@Component({
  selector: 'app-paymentbreakdown',
  templateUrl: './paymentbreakdown.component.html',
  styleUrls: ['./paymentbreakdown.component.scss']
})
export class PaymentbreakdownComponent {


  pageTitle = 'Vouchers';
  errorMessage = '';
  _listFilter = '';
  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value: string) {
    this._listFilter = value;
    // this.filteredPaymentDetails = this.listFilter ? this.performFilter(this.listFilter) : this.paymentDetails;
  }

  // filteredPaymentDetails: PaymentDetail[] = [];
  // paymentDetails: PaymentByCust[] = [];
  pymtMain: Payment[] = [];
  // pymt:Payment;
  serv: Served = new Served();
  cartItems: Served[] = [];
  pymtUser: Registration = new Registration();
  // paramsvalue: number = 0;
  userFullName: string = '';
  loggedInUser: any;
  isServedSuccessfully: boolean = false;

  constructor(public dialogRef: MatDialogRef<PaymentbreakdownComponent>, private dialog: MatDialog, private orderedMealService: OrderedMealService, private servedService: ServedService, private route: ActivatedRoute, private paymentdetailService: PaymentDetailService, private pymtservice: PaymentService, private router: Router, private registrationservice: RegistrationService) { }


  ngOnInit(): void {
    // this.loadCartItems();
    // this.paymentdetailService.
    this.loggedInUser = localStorage.getItem('user');
    this.userFullName = `${this.loggedInUser.firstName} ${this.loggedInUser.lastName}`;
    // this.getPaymentsByCustomer(this.loggedInUser);



    if (this.loggedInUser) {
      const paramvalue = JSON.parse(this.loggedInUser);
      const userId = paramvalue.id;

      // Also, you can call the `getUser` method with the userId
      this.getUser(userId);

      // Now you have the userId, you can use it wherever you need
      // For example, you can pass it to the `getPaymentsByCustomer` method
      this.getPaymentsByCustomer(paramvalue);


    }





  }
  getUser(propertyValue: number): void {
    this.registrationservice.getUser(propertyValue).subscribe((user: Registration) => {
      this.pymtUser = user;
      this.userFullName = `${this.pymtUser.firstName} ${this.pymtUser.lastName}`;
      // this.pymtUser.freeze;

      // this.getPaymentsByCustomer(this.pymtUser);




    });
    // this.pymtUser.freeze;

  }

  getPaymentsByCustomer(customer: Registration): void {
    this.paymentdetailService.getPaidPaymentsByCust(customer).subscribe((payments: Payment[]) => {
      // Process the payments returned by the API
      this.pymtMain = payments;
      this.pymtUser = customer;
    });
  }

  formatWithCommas(value: number | null): string {
    if (value === null) {
      return '';
    }

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatter.format(value);
  }

  openPaymentDetailsDialog(pymtmm: Payment): void {
    // Open the dialog and pass the fetched orderedMeals data to it
    const dialogRef = this.dialog.open(MealNameDialogComponent, {
      data: {

        paymentMain: pymtmm,
        paymentMainId: pymtmm.id,
        // queryParams: { paymentMain: pymtmm, paymentMainId: pymtmm.id }
      },
    });

    // Handle any actions after the dialog is closed (if needed)
    dialogRef.afterClosed().subscribe(result => {
      // Handle dialog close event if needed
      //console.log(`Dialog result: ${result}`);
    });
  }





  onCloseClick(): void {
    this.dialogRef.close();
  }

}
