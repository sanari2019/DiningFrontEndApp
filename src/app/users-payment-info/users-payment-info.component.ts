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
  pymtMain: Payment[]=[];
  // pymt:Payment;
  serv: Served=new Served();
  cartItems: Served[] = [];
  pymtUser: Registration=new Registration();
  // paramsvalue: number = 0;

  constructor(private servedService: ServedService,private route: ActivatedRoute,private paymentdetailService: PaymentDetailService,private pymtservice: PaymentService, private router: Router,private registrationservice: RegistrationService) { }

  // performFilter(filterBy: string): PaymentDetail[] {
  //   filterBy = filterBy.toLocaleLowerCase();
  //   return this.paymentDetails.filter((pymtdetail: PaymentDetail) =>
  //   pymtdetail.custCode.toLocaleLowerCase().indexOf(filterBy) !== -1);
  // }

  ngOnInit(): void {
    // this.loadCartItems();
    // this.paymentdetailService.
    this.route.queryParams.subscribe((params) => {
      var paramvalue = params['pymtMain'];
      this.getUser(paramvalue);
      if (paramvalue) {
                this.pymtMain = JSON.parse(paramvalue);
              }
      // this.registrationservice.getUser(paramvalue)
      //     .subscribe((rslt:Registration)=>{
      //       this.pymtUser=rslt;
      //     }
      //     )
        
      // if (this.pymtUser) {
      //   this.paymentdetailService.getPaidPaymentsByCust(this.pymtUser).subscribe(
      //     (pytMain: Payment[]) => {
      //       this.pymtMain = pytMain;
      //     });
      //   // this.pymtMain = JSON.parse(pymtMainString);
      //   // // Additional logic using pymtMain
      // }
    });
    this.getPaymentsByCustomer(this.pymtUser);
    this.loadCartItems();

  
  }
  getUser(propertyValue: number): void {
    this.registrationservice.getUser(propertyValue).subscribe((user: Registration) => {
      this.pymtUser = user;
      this.getPaymentsByCustomer(this.pymtUser);
    });
  }
  getPaymentsByCustomer(customer: Registration): void {
    this.paymentdetailService.getPaidPaymentsByCust(customer).subscribe((payments: Payment[]) => {
      // Process the payments returned by the API
      this.pymtMain = payments;
    });
  }
  
  updatepayment(pymtdetail: PaymentDetail): void {
    if (pymtdetail.id === 0) {
      // Don't delete, it was never saved.
      this.onSaveComplete();
    } else {
      if (confirm(`You are about serving Customer: ${pymtdetail.custCode} meal`)) {
        pymtdetail.served=true;
        pymtdetail.servedby="solaomotoso";
        pymtdetail.dateserved=new Date();
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
    this.serv.paymentMainid=pymtmm.id;
    this.serv.paymentMain=pymtmm;
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
    this.cartItems.push(this.serv);
    this.loadCartItems(); // Refresh cart items after adding
  }
  
  removeItem(item: Served): void {
    this.ngOnInit();
    this.servedService.deleteServed(item).subscribe({
      next: () => {
        this.loadCartItems(); // Refresh cart items after removal
      },
      error: (err) => {
        this.errorMessage = err;
      }
    });
    this.loadCartItems();
    this.ngOnInit();
  }

  formatWithCommas(value: number | null): string {
    if (value === null) {
      return '';
    }
    
    const formatter = new Intl.NumberFormat('en-US');
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


  loadCartItems(): void {
    this.route.queryParams.subscribe((params) => {
      var paramvalue = params['pymtMain'];
      if (paramvalue) {
        this.registrationservice.getUser(paramvalue).subscribe((user: Registration) => {
          this.getCartItemsForUser(user);
        });
      }
    });
  }
  
  getCartItemsForUser(user: Registration): void {
    this.servedService.getServedByCustomer(user).subscribe({
      next: (items) => {
        this.cartItems = items;
      },
      error: (err) => {
        this.errorMessage = err;
      }
    });

  }
  
  
  
  

  serveItems(): void {
    for (const item of this.cartItems) {
      item.isServed = true; // Set isServed to true
      // item.ServedBy = 
  
      // Call the updateServed method in your service to update the served item
      this.servedService.updateServed(item.id, item).subscribe(
        (updatedServed: Served) => {
          // Handle successful update if needed
          console.log("Served item updated successfully");
        },
        (error: any) => {
          // Handle error if necessary
          console.log("Failed to update served item");
        }
      );
    }
    this.loadCartItems();
    this.ngOnInit();
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


