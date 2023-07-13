  import { Component, OnInit } from '@angular/core';
  import { PaymentDetail } from './paymentdetail.model';
  import { PaymentDetailService } from './paymentdetail.service';
  import { ActivatedRoute, Router } from '@angular/router';
  import { PaymentByCust } from '../users-payment-info/PaymentByCust.model';
  import { Payment } from '../staffpayment/payment.model';
  // import { DecimalPipe } from '@angular/common';



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

    constructor(private route: ActivatedRoute,private paymentdetailService: PaymentDetailService, private router: Router) { }


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
        this.router.navigate(['/users-payment-info'], { queryParams: { pymtMain: JSON.stringify(enteredBy) } });
      }

      formatWithCommas(value: number | null): string {
        if (value === null) {
          return '';
        }
        
        const formatter = new Intl.NumberFormat('en-US');
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


