import { Component, OnInit } from '@angular/core';
// import { PaymentDetail } from '../payment-detail/paymentdetail.model';
// import { PaymentDetailService } from '../payment-detail/paymentdetail.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentDetailComponent } from '../payment-detail/payment-detail.component';
import { PaymentByCust } from './PaymentByCust.model';
// import { PaymentByCust } from './paymentbycust.model';
import { PaymentDetail } from './paymentdetail.model';
import { PaymentDetailService } from './paymentdetail.service';
// import { ActivatedRoute } from '@angular/router';
import { Payment } from '../staffpayment/payment.model';
import { Served } from './served.model';
import { PaymentService } from '../staffpayment/payment.service';
import { ServedService } from './served.service';
import { Registration } from '../registration/registration.model';
import { RegistrationService } from '../registration/registration.service';
// import { DecimalPipe } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';
import { MealNameDialogComponent } from '../meal-name-dialog/meal-name-dialog.component';
import { OrderedMeal } from '../guestpayment/orderedmeal.model';
import { Menu } from '../guestpayment/menu.model';
import { MenuService } from '../guestpayment/menu.service';
// import { OrderedMeal } from '../guestpayment/orderedmeal.model';
import { OrderedMealService } from '../guestpayment/orderedmeal.service';
import { GuestpaymentComponent } from '../guestpayment/guestpayment.component';
import { ServedEmail } from './servedEmail.model';
// import { MatDialog } from '@angular/material/dialog';
import { LoaderComponent } from '../loader/loader.component';
import { LoaderService } from '../loader/loader.service';
import { Observable } from 'rxjs';





// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { PaymentService } from '../staffpayment/payment.service';
// import { Payment } from '../staffpayment/payment.model';
// import { Served } from './served.model';
// import { PaymentDetailService } from './paymentdetail.service';
// import { PaymentDetail } from './paymentdetail.model';
// import { ServedService } from './served.service';

// @Component({
//   selector: 'app-users-payment-info',
//   templateUrl: './users-payment-info.component.html',
//   styleUrls: ['./users-payment-info.component.scss']
// })
// export class UsersPaymentInfoComponent implements OnInit {
//   pageTitle = 'Vouchers';
//   errorMessage = '';
//   pymtMain: Payment[] = [];
//   serv: Served = new Served();
//   cartItems: Served[] = [];

//   constructor(
//     private route: ActivatedRoute,
//     private paymentdetailService: PaymentDetailService,
//     private pymtservice: PaymentService,
//     private servedService: ServedService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.route.queryParams.subscribe((params) => {
//       const pymtMainString = params['pymtMain'];
//       if (pymtMainString) {
//         this.pymtMain = JSON.parse(pymtMainString);
//       }
//     });
//     this.loadCartItems();
//   }

//   loadCartItems(): void {
//     this.servedService.getServed().subscribe({
//       next: (items) => {
//         this.cartItems = items;
//       },
//       error: (err) => {
//         this.errorMessage = err;
//       }
//     });
//   }

//   updatePayment(pymtDetail: PaymentDetail): void {
//     // ...
//   }

//   addItem(pymt: Payment): void {

//     this.serv.ServedBy = 3;
//     this.serv.dateserved = new Date();
//     this.serv.paymentMain = pymt;
//     this.serv.paymentMainid = pymt.id;
//     this.servedService.addServed(this.serv).subscribe({
//       error: (err) => {
//         this.errorMessage = err;
//       }
//     });
//     this.loadCartItems(); // Refresh cart items after adding
//   }

//   removeItem(item: Served): void {
//     this.servedService.deleteServed(item).subscribe({
//       next: () => {
//         this.loadCartItems(); // Refresh cart items after removal
//       },
//       error: (err) => {
//         this.errorMessage = err;
//       }
//     });
//   }

//   serveItems(): void {
//     // ...
//   }

//   onSaveComplete(): void {
//     this.ngOnInit();
//   }
// }




@Component({
  selector: 'app-users-payment-info',
  templateUrl: './users-payment-info.component.html',
  styleUrls: ['./users-payment-info.component.scss']
})
export class UsersPaymentInfoComponent {



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
  servedEmail: ServedEmail = new ServedEmail();
  showSpinner = false;
  isLoading$: Observable<boolean>;

  constructor(private loaderService: LoaderService, private orderedMealService: OrderedMealService, private dialog: MatDialog, private servedService: ServedService, private route: ActivatedRoute, private paymentdetailService: PaymentDetailService, private pymtservice: PaymentService, private router: Router, private registrationservice: RegistrationService) {
    this.isLoading$ = this.loaderService.isLoading$;

  }
  // Fetch the orderedMeals data from the server

  // performFilter(filterBy: string): PaymentDetail[] {
  //   filterBy = filterBy.toLocaleLowerCase();
  //   return this.paymentDetails.filter((pymtdetail: PaymentDetail) =>
  //   pymtdetail.custCode.toLocaleLowerCase().indexOf(filterBy) !== -1);
  // }
  // Check if the voucher type is 'alacart' or payment type is 2


  ngOnInit(): void {
    // this.loadCartItems();
    // this.paymentdetailService.
    this.route.queryParams.subscribe((params) => {
      var paramvalue = params['pymtMain'];

      if (paramvalue) {
        this.getUser(paramvalue);
        // this.loadCartItems();
      }
      this.userFullName = params['userFullName'] || '';
    });


  }
  getUser(propertyValue: number): Registration {
    this.registrationservice.getUser(propertyValue).subscribe((user: Registration) => {
      this.pymtUser = user;
      this.userFullName = `${this.pymtUser.firstName} ${this.pymtUser.lastName}`;
      if (this.pymtUser.freeze = true) {
        this.getPaymentsByCustomer(this.pymtUser);
        this.loadCartItems();
      } else {
        ////console.log("Frozen")
      }


    });
    return this.pymtUser;
  }
  getPaymentsByCustomer(customer: Registration): void {
    this.paymentdetailService.getPaidPaymentsByCust(customer).subscribe((payments: Payment[]) => {
      // Process the payments returned by the API
      this.pymtMain = payments;
      this.pymtUser = customer;
    });
  }

  updatepayment(pymtdetail: PaymentDetail): void {
    if (pymtdetail.id === 0) {
      // Don't delete, it was never saved.
      this.onSaveComplete();
    } else {
      if (confirm(`You are about serving Customer: ${pymtdetail.custCode} meal`)) {
        pymtdetail.served = true;
        pymtdetail.servedby = "solaomotoso";
        pymtdetail.dateserved = new Date();
        this.paymentdetailService.updatePaymentDetails(pymtdetail)
          .subscribe({
            next: () => this.onSaveComplete(),
            error: err => this.errorMessage = err
          });
      }
    }
  }

  // addItem(pymt: Payment): void {
  //   this.serv.ServedBy = 3;
  //   this.serv.dateserved = new Date();
  //   this.serv.paymentMain = pymt;
  //   this.serv.paymentMainid = pymt.id;
  //   this.servedService.addServed(this.serv).subscribe({
  //     error: (err) => {
  //       this.errorMessage = err;
  //     }
  //   });
  //   this.loadCartItems(); // Refresh cart items after adding
  // }

  addItem(pymtmm: Payment): void {

    this.serv.dateserved = new Date();
    this.serv.paymentMainid = pymtmm.id;
    this.serv.paymentMain = pymtmm;
    this.pymtservice.Serve(this.serv)
      .subscribe({
        next: () => this.onSaveComplete(),
        error: err => this.errorMessage = err
      });

    // this.servedService.addServed(this.serv).subscribe({
    //       error: (err) => {
    //         this.errorMessage = err;
    //       }
    //     });
    // this.cartItems.push(this.serv);
    // this.loadCartItems(); // Refresh cart items after adding
  }

  removeItem(item: Served): void {
    // this.ngOnInit();
    this.servedService.deleteServed(item).subscribe({
      next: () => {
        this.loadCartItems(); // Refresh cart items after removal
      },
      error: (err) => {
        this.errorMessage = err;
      }
    });
    // this.loadCartItems();
    this.ngOnInit();
  }

  formatWithCommas(value: number | null): string {
    if (value === null) {
      return '';
    }

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatter.format(value);
  }




  // serveItems(): void {
  //   this.servedService.insertServedItems(this.cartItems).subscribe({
  //     next: () => {
  //       // Success handling
  //       this.cartItems = []; // Clear the cart after serving items
  //     },
  //     error: err => this.errorMessage = err
  //   });
  // }

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
      ////console.log(`Dialog result: ${result}`);
    });
  }




  loadCartItems(): void {
    this.servedService.getServedByCustomer(this.pymtUser).subscribe({
      next: (serves: Served[]) => {
        this.cartItems = serves;
      }
    });
  }
  // getUser(username: string): Registration {
  //   this.registrationservice.getUserbyusername(username)
  //     .subscribe({
  //       next: (registration: Registration) => this.registration,
  //       error: err => this.errorMessage = err
  //     });
  //   return this.registration
  // }


  // getCartItemsForUser(user: Registration): void {
  //   this.servedService.getServedByCustomer(user).subscribe({
  //     next: (items) => {
  //       this.cartItems = items;
  //     },
  //     error: (err) => {
  //       this.errorMessage = err;
  //     }
  //   });

  // }





  serveItems(): void {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    let totalAmount = 0;
    for (const item of this.cartItems) {
      item.isServed = true; // Set isServed to true
      item.ServedBy = loggedInUser?.id;
      // Prepare the ServedEmail model
      totalAmount += item.paymentMain.amount;

      // Call the updateServed method in your service to update the served item
      this.servedService.updateServed(item).subscribe(
        (updatedServed: Served) => {
          // Handle successful update if needed
          this.isServedSuccessfully = true;
          ////console.log("Served item updated successfully");


          // this.servedEmail.amount = updatedServed.paymentMain.amount;

        },
        (error: any) => {
          // Handle error if necessary
          ////console.log("Failed to update served item");
        }
      );


    }
    // this.pymtUser.freeze = true;
    this.registrationservice.updateUser(this.pymtUser).subscribe((reg: Registration) => {
      this.pymtUser = reg;
      this.pymtUser.freeze = true;
      reg.freeze = true;
    });

    // Prepare the ServedEmail model using the totalAmount
    const servedEmail: ServedEmail = new ServedEmail();
    servedEmail.amount = totalAmount;
    servedEmail.serversName = loggedInUser?.firstName; // You might need to get the server's name from the backend
    servedEmail.customerName = this.userFullName;
    servedEmail.customerFirstName = this.pymtUser.firstName;
    servedEmail.dateServed = new Date(); // You can set the date here as needed
    servedEmail.customerUserName = this.pymtUser.userName;

    // Call the sendServedEmail method to send the email
    this.servedService.sendServedEmail(servedEmail).subscribe(
      (sentEmailResponse: ServedEmail) => {
        ////console.log("Served email sent successfully", sentEmailResponse);
        // Handle successful email sending if needed

        // Refresh the cart items and the component
        this.loadCartItems();
        this.ngOnInit();
      },
      (error: any) => {
        ////console.log("Failed to send served email", error);
        // Handle email sending error if necessary
      }
    );

    this.registrationservice.updateUser(loggedInUser).subscribe
  }



  // navigateToDetails(pymtdetails: any) {
  //   localStorage.setItem('pymtdetails', JSON.stringify(pymtdetails));
  //   this.router.navigate(['/users-payment-info']);
  // }

  onSaveComplete(): void {
    // this.registrationForm.reset();
    //this.router.navigate(['/voucher']);
    this.ngOnInit();
  };
}


