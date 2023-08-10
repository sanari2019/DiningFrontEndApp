import { Component, OnInit } from '@angular/core';
import { PaymentDetail } from './paymentdetail.model';
import { PaymentDetailService } from './paymentdetail.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentByCust } from '../users-payment-info/PaymentByCust.model';
import { Payment } from '../staffpayment/payment.model';
// import { DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { UsersPaymentInfoDialogComponent } from '../users-payment-info-dialog/users-payment-info-dialog.component';
import { Registration } from '../registration/registration.model';
import { RegistrationService } from '../registration/registration.service';





@Component({
  selector: 'app-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.scss']
})
export class PaymentDetailComponent implements OnInit {

  pageTitle = 'Vouchers';
  errorMessage = '';
  _listFilter = '';
  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value: string) {
    this._listFilter = value;
    this.filteredPaymentDetails = this.listFilter ? this.performFilter(this.listFilter) : this.pymtByCust;
  }

  filteredPaymentDetails: PaymentByCust[] = [];
  pymtByCust: PaymentByCust[] = [];
  pymtMain: Payment[] = [];
  loggedInUser: Registration | undefined;



  constructor(private registrationService: RegistrationService, public dialog: MatDialog, private route: ActivatedRoute, private paymentdetailService: PaymentDetailService, private router: Router) { }

  // Pagination properties
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];


  // Calculate the total number of pages based on the pageSize and the paymentDetails length
  get totalPages(): number {
    return Math.ceil(this.filteredPaymentDetails.length / this.pageSize);
  }

  // Calculate the starting and ending index of the current page
  get startIndex(): number {
    return this.currentPage * this.pageSize;
  }


  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredPaymentDetails.length);
  }


  // Function to handle page change event
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
  }


  // Function to get the current page data
  getCurrentPageData(): any[] {
    return this.filteredPaymentDetails.slice(this.startIndex, this.endIndex);
  }




  // navigateToDetails(paymentbycust: PaymentByCust): void {
  //   this.router.navigate(['/users-payment-info'], { queryParams: { pymtMain: JSON.stringify(paymentbycust.enteredBy) } });
  //   // this.paymentdetailService.getPaidPaymentsByCust(paymentbycust).subscribe(
  //   //   (pytMain: Payment[]) => {
  //   //     this.pymtMain = pytMain;
  //   //     // this.filteredPaymentDetails = this.paymentDetails;
  //   //     this.router.navigate(['/users-payment-info'], { queryParams: { pymtMain: JSON.stringify(this.pymtMain) } });
  //   //   });
  //   }
  navigateToDetails(paymentbycust: PaymentByCust): void {
    const enteredBy = parseInt(paymentbycust.enteredBy, 10);
    this.router.navigate(['/voucherdetails'], { queryParams: { pymtMain: JSON.stringify(enteredBy) } });
    const dialogRef = this.dialog.open(UsersPaymentInfoDialogComponent, {
      width: '90%',
      data: {
        pymtMain: JSON.stringify(enteredBy),
        enteredBy: enteredBy,
        paymentbycust: paymentbycust,
        queryParams: { pymtMain: JSON.stringify(enteredBy), enteredBy: enteredBy.toString() }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle dialog close event if needed
      console.log(`Dialog result: ${result}`);
      this.onSaveComplete()
    });
  }

  // navigateToDetails(paymentbycust: PaymentByCust): void {
  //   const enteredBy = parseInt(paymentbycust.enteredBy, 10);
  //   const dialogRef = this.dialog.open(UsersPaymentInfoDialogComponent, {
  //     width: '70%',
  //     data: {
  //       pymtMain: JSON.stringify(enteredBy),
  //       enteredBy: enteredBy,
  //       paymentbycust: paymentbycust,
  //       queryParams: { pymtMain: JSON.stringify(enteredBy), enteredBy: enteredBy.toString()}
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     // Handle dialog close event if needed
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }

  formatWithCommas(value: number | null): string {
    if (value === null) {
      return '';
    }

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatter.format(value);
  }





  performFilter(filterBy: string): PaymentByCust[] {
    filterBy = filterBy.toLocaleLowerCase();
    return this.pymtByCust.filter((pytByCust: PaymentByCust) =>
      pytByCust.custCode.toLocaleLowerCase().indexOf(filterBy) !== -1);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // const enteredBy = params['enteredBy'];
      this.paymentdetailService.getPaidPayments().subscribe(
        (pymtbycust: PaymentByCust[]) => {
          this.pymtByCust = pymtbycust;
          this.filteredPaymentDetails = this.pymtByCust;
        },
        (error) => {
          console.log('Error retrieving paid payments:', error);
        }
      );
    });
  }




  // updatepayment(pymtdetail: PaymentDetail): void {
  //   if (pymtdetail.id === 0) {
  //     // Don't delete, it was never saved.
  //     this.onSaveComplete();
  //   } else {
  //     if (confirm(`You are about serving Customer: ${pymtdetail.custCode} meal`)) {
  //       pymtdetail.served=true;
  //       pymtdetail.servedby="solaomotoso";
  //       pymtdetail.dateserved=new Date();
  //       this.paymentdetailService.updatePaymentDetails(pymtdetail)
  //         .subscribe({
  //           next: () => this.onSaveComplete(),
  //           error: err => this.errorMessage = err
  //         });
  //     }
  //   }
  // }

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


