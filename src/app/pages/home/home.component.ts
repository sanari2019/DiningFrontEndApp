import { Component, OnInit } from '@angular/core';
import { Registration } from 'src/app/registration/registration.model';
import { RegistrationService } from 'src/app/registration/registration.service';
import { PaymentDetailService } from 'src/app/users-payment-info/paymentdetail.service';
import { PaymentByCust } from 'src/app/users-payment-info/PaymentByCust.model';
import { PaymentDetail } from 'src/app/users-payment-info/paymentdetail.model';
import { Payment } from 'src/app/staffpayment/payment.model';
import { VoucherService } from 'src/app/voucher/voucher.service';
import { Voucher } from 'src/app/voucher/voucher.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RecentTransaction } from './recent-transaction.model';
import { MatDialog } from '@angular/material/dialog';
import { PaymentbreakdownComponent } from 'src/app/paymentbreakdown/paymentbreakdown.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  totalAmount: number = 0;
  totalAmountByVoucherId: { [key: number]: number } = {};
  voucherStats: { [key: number]: { count: number; totalUnits: number } } = {};
  voucherDescriptions: { [key: number]: Observable<string> } = {};
  recentTransactions: RecentTransaction[] = [];
  shakeState = 'shakeStart';
  pymtUser: Registration = new Registration();
  freezeStatus: boolean = false;
  user: Registration = {
    id: 0,
    custTypeId: 0,
    custId: '',
    firstName: '',
    lastName: '',
    userName: '',
    password: '',
    freeze: false
  };

  constructor(public dialog: MatDialog,
    private registrationService: RegistrationService,
    private paymentDetailService: PaymentDetailService,
    private voucherService: VoucherService) { }

  ngOnInit(): void {
    // Fetch the logged-in user from local storage
    const loggedInUserData = localStorage.getItem('user');

    if (loggedInUserData) {
      const loggedInUser = JSON.parse(loggedInUserData);

      this.getUser(loggedInUser.id);
      // Fetch the payment details for the logged-in user
      this.paymentDetailService.getPaidPaymentsByCust(loggedInUser).subscribe((payments: Payment[]) => {
        // Calculate totalAmount from the payment details
        this.totalAmount = payments.reduce((sum, payment) => sum + (payment.unit * payment.amount), 0);

        // Calculate totalAmount by voucher ID
        this.totalAmountByVoucherId = {};
        payments.forEach(payment => {
          if (this.totalAmountByVoucherId[payment.voucherId]) {
            this.totalAmountByVoucherId[payment.voucherId] += payment.unit * payment.amount;
          } else {
            this.totalAmountByVoucherId[payment.voucherId] = payment.unit * payment.amount;
          }
        });



        // Calculate voucher statistics
        this.voucherStats = {};
        payments.forEach(payment => {
          if (!this.voucherStats[payment.voucherId]) {
            this.voucherStats[payment.voucherId] = { count: 0, totalUnits: 0 };
          }
          this.voucherStats[payment.voucherId].count++;
          this.voucherStats[payment.voucherId].totalUnits += payment.unit;

          // Fetch voucher description using the voucherService
          if (!this.voucherDescriptions[payment.voucherId]) {
            this.voucherDescriptions[payment.voucherId] = this.voucherService.getVoucher(payment.voucherId).pipe(
              map((vouchers: Voucher[]) => {
                const matchingVoucher = vouchers.find(voucher => voucher.id === payment.voucherId);
                return matchingVoucher ? matchingVoucher.description : 'Ala Carte';
              }),
              catchError(() => of('Error fetching description'))
            );
          }
        });
      });





    }






  }
  getUser(propertyValue: number): void {
    this.registrationService.getUser(propertyValue).subscribe((user: Registration) => {
      this.pymtUser = user;
      this.freezeStatus = user.freeze;
      // this.userFullName = `${this.pymtUser.firstName} ${this.pymtUser.lastName}`;
      // this.pymtUser.freeze;

      // this.getPaymentsByCustomer(this.pymtUser);




    });
    // this.pymtUser.freeze;

  }

  toggleFreezeStatus(): void {
    this.user.freeze = !this.user.freeze; // Toggle the freeze status

    this.registrationService.updateUser(this.user).subscribe(
      (updatedUser: Registration) => {
        console.log('Freeze status updated successfully:', updatedUser);
      },
      (error) => {
        console.error('Error updating freeze status:', error);
      }
    );

  }

  getCardClass(voucherId: string): string {
    switch (voucherId) {
      case '1':
        return 'card green';
      case '2':
        return 'card orange';
      case '10':
        return 'card red';
      default:
        return 'card blue'; // Default class if no match
    }
  }

  // getVoucherDescription(voucherId: string): Observable<string> {
  //   const voucherObservable = this.voucherService.getVoucher(parseInt(voucherId));

  //   return voucherObservable.pipe(
  //     map((vouchers: Voucher[]) => {
  //       const matchingVoucher = vouchers.find(voucher => voucher.id === parseInt(voucherId));
  //       return matchingVoucher ? matchingVoucher.description : 'Unknown Description';
  //     })
  //   );
  // }
  getVoucherDescription(voucherId: string): Observable<string> {
    return this.voucherDescriptions[+voucherId.toString()];
  }

  openPaymentBreakdownDialog(): void {
    const dialogRef = this.dialog.open(PaymentbreakdownComponent, {
      width: 'auto',
    });
    this.shakeState = 'shakeEnd'; // Stop the shaking animation
  }





}
