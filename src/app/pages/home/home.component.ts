import { Component, OnInit, VERSION, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
// import { Component, OnInit } from '@angular/core';
import { Registration } from 'src/app/registration/registration.model';
import { RegistrationService } from 'src/app/registration/registration.service';
import { PaymentDetailService } from 'src/app/users-payment-info/paymentdetail.service';
import { PaymentService } from 'src/app/staffpayment/payment.service';
import { PaymentByCust } from 'src/app/users-payment-info/PaymentByCust.model';
import { PaymentDetail } from 'src/app/users-payment-info/paymentdetail.model';
import { Payment } from 'src/app/staffpayment/payment.model';
import { VoucherService } from 'src/app/voucher/voucher.service';
import { Voucher } from 'src/app/voucher/voucher.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HistoryRecords } from './historyrecords.model';
import { MatDialog } from '@angular/material/dialog';
import { PaymentbreakdownComponent } from 'src/app/paymentbreakdown/paymentbreakdown.component';
import { ServedService } from 'src/app/users-payment-info/served.service';
import { ServedEmail } from 'src/app/users-payment-info/servedEmail.model';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { ServedAlacarteVoucherModel } from '../Administration/servedAlacartVoucherModel.model';
import { OrderedMealService } from 'src/app/guestpayment/orderedmeal.service';
// import { DateRange } from 'igniteui-angular';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ExportService } from 'src/app/shared/services/export.service';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { formatDate } from "@angular/common";
import { Router } from '@angular/router';
import { ContactUsDialogComponent } from 'src/app/contact-us-dialog/contact-us-dialog.component';
import { AvailableMeal } from 'src/app/createmealdialog/availableMeal.model';
import { AvailableMealService } from 'src/app/createmealdialog/available-meal.service';
import { Transfer } from 'src/app/shared/transfer.model';
import { TransferService } from 'src/app/shared/transfer.service';
import { Feedback } from 'src/app/shared/feedback.model';
import { FeedbackService } from 'src/app/shared/feedback.service';
import { UserValidateComponent } from 'src/app/user-validate/user-validate.component';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { data } from 'jquery';
import { TransferTransaction } from 'src/app/shared/transferTransaction.model';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  servedData: HistoryRecords[] = [];
  selected = 'option0';
  showTable = false;
  isSubmitClicked = false;
  dateServed: Date = new Date(); // Replace this with your actual date
  form!: FormGroup;
  Transferform!: FormGroup;
  Feedbackform!: FormGroup;
  activeMeals: AvailableMeal[] = [];
  transferobj: Transfer[] = [];
  feedbackobj!: Feedback;
  payments: Payment[] = [];
  pymt!: Payment;
  message: any;



  // formattedDate: string;
  totalAmount: number = 0;
  totalAmountByVoucherId: { [key: number]: number } = {};
  voucherStats: { [key: number]: { count: number; totalUnits: number } } = {};
  voucherDescriptions: { [key: number]: Observable<string> } = {};
  recentTransactions: HistoryRecords[] = [];
  shakeState = 'shakeStart';
  pymtUser: Registration = new Registration();
  freezeStatus: boolean = false;
  ServedBy: number = 1;
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
  r_user!: Registration;
  isHandset: boolean = false; // Add a property to track handset breakpoint
  isValidated: boolean = false;
  contactOption: boolean = false;
  transferTransaction!: TransferTransaction;
  pymtid: number = 0;



  private observeHandsetBreakpoint(): void {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(untilDestroyed(this))
      .subscribe((state) => {
        this.isHandset = state.matches;
      });
  }

  constructor(private availablemealService: AvailableMealService, private router: Router, public dialog: MatDialog,
    private notificationService: NotificationService,
    private fb: FormBuilder, private exportService: ExportService, private _liveAnnouncer: LiveAnnouncer,
    private breakpointObserver: BreakpointObserver,
    private servedService: ServedService,
    private paymentService: PaymentService,
    private registrationService: RegistrationService,
    private ordmealService: OrderedMealService,
    private transferService: TransferService,
    private feedbackService: FeedbackService,
    private paymentDetailService: PaymentDetailService,
    private voucherService: VoucherService) {

    this.Transferform = this.fb.group({
      voucher: [null, Validators.required],
      user: ['', Validators.required],
      quantity: [null, Validators.required],
    });
    this.Feedbackform = this.fb.group({
      experience: ['', Validators.required],
      contactOption: [this.contactOption]
    });
  }

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  displayedColumns: string[] = ['dateServed', 'SourceTable', 'Unit', 'FirstName', 'Amount'];
  dataSource = new MatTableDataSource<ServedAlacarteVoucherModel>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('this.dataSource') userTable!: ElementRef;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }

  }

  ngOnInit(): void {



    // Fetch the logged-in user from local storage
    const loggedInUserData = localStorage.getItem('user');

    if (loggedInUserData) {
      const loggedInUser = JSON.parse(loggedInUserData);
      this.user.firstName = loggedInUser.firstName;
      this.ServedBy = loggedInUser.id;
      // this.getHistoryRecords(this.ServedBy);
      // this.getUser(loggedInUser.id);
      // Fetch the payment details for the logged-in user
      this.paymentDetailService.getPaidPaymentsByCust(loggedInUser).subscribe((payments: Payment[]) => {
        // Calculate totalAmount from the payment details
        this.totalAmount = payments.reduce((sum, payment) => sum + (payment.unit * payment.amount), 0);
        this.payments = payments;
        this.servedService.getHistoryRecords(this.ServedBy).subscribe((data: HistoryRecords[]) => {
          this.servedData = data;
        })
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


    // this.getServedAlacart();


    // this.ordmealService.getAlacarteOrders(new Date('01-09-2023'), new Date('30-09-2023')).subscribe((data: ServedAlacarteVoucherModel[]) => {
    //   this.servedData = data;
    // });
    this.availablemealService.getActiveMeals().subscribe(data => {
      // Handle the data returned by the service
      this.activeMeals = data;
    });


  }

  notifyError(message: any): void {
    this.notificationService.error(message);
  }

  notifySuccess(message: any): void {
    this.notificationService.success(message);
  }

  postFeedback() {
    const experienceback = this.Feedbackform.value.experience;
    const contact = this.Feedbackform.value.contact;
    const UserJSON = localStorage.getItem('user');

    if (this.Feedbackform.valid && UserJSON) {
      const fUser = JSON.parse(UserJSON);
      const feedback: Feedback = {
        id: 0,
        userId: fUser.id,
        experience: experienceback,
        contactOption: this.contactOption,
      }
      this.feedbackService.postFeedback(feedback).subscribe((data: Feedback) => {
        this.feedbackobj = data;
      });
      this.Feedbackform.reset();
      this.notifySuccess('Posted Successfully')

    } else {
      this.notifyError('Incomplete Form / undefined User')
    }



  }

  complete() {
    const selectedVoucherId = this.Transferform.value.voucher;
    const selectedUsername = this.Transferform.value.user;
    // this.registrationService.getUserbyusername(selectedUsername).subscribe(data => {
    //   this.r_user = data;
    // });

    const rUserJSON = localStorage.getItem('r_user');
    const pymtJSON = localStorage.getItem('pymt');



    if (this.Transferform.valid && rUserJSON && pymtJSON) {
      // Check if the quantity is greater than the selected voucher's quantity
      const rUser = JSON.parse(rUserJSON);
      const uPymt = JSON.parse(pymtJSON);
      this.paymentService.getPymt(uPymt.id).subscribe(data => {
        this.pymt = data;
        // localStorage.setItem('pymt', JSON.stringify(this.pymt));
      });
      const selectedVoucher = this.payments.find(payment => payment.id === selectedVoucherId);
      console.log(selectedVoucher);


      if (selectedVoucher) {
        const selectedVoucherQuantity = selectedVoucher.unit;

        if (this.Transferform.value.quantity > selectedVoucherQuantity) {
          // Display an error message
          // You can handle this error message as per your application's UI requirements.
          console.log('The Quantity is more than the selected voucher quantity');
        } else {
          // Quantity is valid, you can proceed with the transfer
          console.log('Quantity is valid, proceed with the transfer');
          // You can call your transfer service or perform any necessary actions here.
          // Create a Payment object based on the form values
          const loggedInUserData = localStorage.getItem('user');
          if (loggedInUserData) {
            const loggedInUser = JSON.parse(loggedInUserData);
            const payment: Payment = {
              id: 0,
              dateEntered: new Date(),
              enteredBy: rUser.id.toString(),
              custCode: rUser.custId,
              voucherId: selectedVoucher.voucherId,
              unit: this.Transferform.value.quantity,
              amount: selectedVoucher.amount,
              paymentmodeid: selectedVoucher.paymentmodeid,
              servedby: selectedVoucher.servedby,
              opaymentid: uPymt.opaymentid,
              paid: selectedVoucher.paid,
              timepaid: new Date(),
              paymentType: this.pymt.paymentType,
              custtypeid: rUser.custTypeId,
              VoucherDescription: '',
            };




            // Set the new unit value for uPymt
            uPymt.unit = uPymt.unit - this.Transferform.value.quantity;



            // Update the payment using the paymentService
            this.paymentService.updatePayment(uPymt).subscribe(
              (updatedPayment: Payment) => {

                console.log('Payment updated successfully:');
                // You can handle the success here
              },
              (error) => {
                console.error('Error while updating payment:', error);
                // You can handle errors here
              }
            );

            // Call the createPayment method from your service
            this.paymentService.createPayment(payment).subscribe(
              (createdPayment) => {
                console.log('Payment created successfully:');
                this.pymtid = createdPayment.id;

                // You can handle success here
              },
              (error) => {
                console.error('Error while creating payment:', error);
                // You can handle errors here
              }
            );
            const transfer: Transfer = {
              id: 0,
              voucherId: this.Transferform.value.voucher,
              quantity: this.Transferform.value.quantity,
              transferredBy: loggedInUser.userName,
              enteredBy: loggedInUser.id,
              snRead: false,
              byCustCode: loggedInUser.custId,
              s_pymtmainid: uPymt.id,
              transferredTo: this.Transferform.value.user,
              receivedBy: rUser.id,
              toCustCode: rUser.custId,
              rnRead: false,
              r_pymtmainid: this.pymtid,
              dateTransferred: new Date(),
              transferType: 'S',
              success: true,
            };

            this.transferService.insertTransfer(transfer).subscribe(
              (response) => {
                console.log('Transfer successful:');
                this.message = "Successfully";
                this.notifySuccess(this.message);
              },
              (error) => {
                console.error('Error while transferring:', error);
                this.message = "Error!!!";
                this.notifyError(this.message);
              }
            );

            localStorage.removeItem('r_user');
            localStorage.removeItem('pymt');
            this.Transferform.reset();
            this.isValidated = false;
            this.ngOnInit();
          }
        }

      } else {
        // Handle the case where the selected voucher is not found
        console.log('Selected voucher not found');
      }
    } else {
      // Handle form validation errors
      console.log('Form is not valid');
    }
  }

  complete2() {
    const selectedVoucherId = this.Transferform.value.voucher;
    const selectedUsername = this.Transferform.value.user;
    // this.registrationService.getUserbyusername(selectedUsername).subscribe(data => {
    //   this.r_user = data;
    // });

    const rUserJSON = localStorage.getItem('r_user');
    const pymtJSON = localStorage.getItem('pymt');



    if (this.Transferform.valid && rUserJSON && pymtJSON) {
      // Check if the quantity is greater than the selected voucher's quantity
      const rUser = JSON.parse(rUserJSON);
      const uPymt = JSON.parse(pymtJSON);
      this.paymentService.getPymt(uPymt.id).subscribe(data => {
        this.pymt = data;
        // localStorage.setItem('pymt', JSON.stringify(this.pymt));
      });
      const selectedVoucher = this.payments.find(payment => payment.id === selectedVoucherId);
      console.log(selectedVoucher);


      if (selectedVoucher) {
        const selectedVoucherQuantity = selectedVoucher.unit;

        if (this.Transferform.value.quantity > selectedVoucherQuantity) {
          // Display an error message
          // You can handle this error message as per your application's UI requirements.
          console.log('The Quantity is more than the selected voucher quantity');
        } else {
          // Quantity is valid, you can proceed with the transfer
          console.log('Quantity is valid, proceed with the transfer');
          // You can call your transfer service or perform any necessary actions here.
          // Create a Payment object based on the form values
          const loggedInUserData = localStorage.getItem('user');
          if (loggedInUserData) {
            const loggedInUser = JSON.parse(loggedInUserData);
            const payment: Payment = {
              id: 0,
              dateEntered: new Date(),
              enteredBy: rUser.id.toString(),
              custCode: rUser.custId,
              voucherId: selectedVoucher.voucherId,
              unit: this.Transferform.value.quantity,
              amount: selectedVoucher.amount,
              paymentmodeid: selectedVoucher.paymentmodeid,
              servedby: selectedVoucher.servedby,
              opaymentid: uPymt.opaymentid,
              paid: selectedVoucher.paid,
              timepaid: new Date(),
              paymentType: selectedVoucher.id,
              custtypeid: rUser.custTypeId,
              VoucherDescription: '',
            };




            // Set the new unit value for uPymt
            // uPymt.unit = uPymt.unit - this.Transferform.value.quantity;



            // // Update the payment using the paymentService
            // this.paymentService.updatePayment(uPymt).subscribe(
            //   (updatedPayment: Payment) => {

            //     console.log('Payment updated successfully:', updatedPayment);
            //     // You can handle the success here
            //   },
            //   (error) => {
            //     console.error('Error while updating payment:', error);
            //     // You can handle errors here
            //   }
            // );

            // // Call the createPayment method from your service
            // this.paymentService.createPayment(payment).subscribe(
            //   (createdPayment) => {
            //     console.log('Payment created successfully:', createdPayment);
            //     // You can handle success here
            //   },
            //   (error) => {
            //     console.error('Error while creating payment:', error);
            //     // You can handle errors here
            //   }
            // );
            const transfer: Transfer = {
              id: 0,
              voucherId: this.Transferform.value.voucher,
              quantity: this.Transferform.value.quantity,
              transferredBy: loggedInUser.userName,
              enteredBy: loggedInUser.id,
              snRead: false,
              byCustCode: loggedInUser.custId,
              s_pymtmainid: uPymt.id,
              transferredTo: this.Transferform.value.user,
              receivedBy: rUser.id,
              toCustCode: rUser.custId,
              rnRead: false,
              r_pymtmainid: payment.id,
              dateTransferred: new Date(),
              transferType: 'S',
              success: true,
            };
            const transferTransaction: TransferTransaction = {
              updatedPaymentMainData: uPymt,
              paymentMainData: payment,
              transferData: transfer,
            }

            // this.transferService.insertTransfer(transfer).subscribe(
            //   (response) => {
            //     console.log('Transfer successful:', response);
            //     this.message = "Successfully";
            //     this.notifySuccess(this.message);
            //   },
            //   (error) => {
            //     console.error('Error while transferring:', error);
            //     this.message = "Error!!!";
            //     this.notifyError(this.message);
            //   }
            // );

            this, this.transferService.completePayment(transferTransaction).subscribe(
              (response) => {
                console.log('Transfer successful:', response);
                this.message = "Successfully";
                this.notifySuccess(this.message);

              },
              (error) => {
                console.error('Error while transferring:', error);
                this.message = "Error!!!";
                this.notifyError(this.message);
              }
            );

            localStorage.removeItem('r_user');
            localStorage.removeItem('pymt');
            this.Transferform.reset();
            this.isValidated = false;
            this.ngOnInit();
          }
        }

      } else {
        // Handle the case where the selected voucher is not found
        console.log('Selected voucher not found');
      }
    } else {
      // Handle form validation errors
      console.log('Form is not valid');
    }
  }

  ResetForm() {
    this.Transferform.reset();
    this.isValidated = false;
  }

  // onSubmit() {
  //   const loggedInUserData = localStorage.getItem('user');


  //   if (this.Transferform.valid && loggedInUserData) {
  //     // Create a Transfer object based on the form values
  //     const loggedInUser = JSON.parse(loggedInUserData);
  //     const transfer: Transfer = {
  //       id: 0,
  //       voucherId: this.Transferform.value.voucher,
  //       quantity: this.Transferform.value.quantity,
  //       transferredBy: loggedInUser.userName,
  //       enteredBy: loggedInUser.id,
  //       snRead: false,
  //       byCustCode: loggedInUser.custId,
  //       transferredTo: this.Transferform.value.user,
  //       receivedBy: 0,
  //       toCustCode: 'your_tocustcode_value',
  //       rnRead: false,
  //       dateTransferred: new Date(),
  //       transferType: 'S',
  //       success: false,
  //     };

  //     // Call the insertTransfer method from your service
  //     this.transferService.insertTransfer(transfer).subscribe(
  //       (response) => {
  //         this.notifySuccess('Transfer successful:';
  //         // You can handle success here
  //       },
  //       (error) => {
  //         this.notifyError('Error while transferring:');
  //         // You can handle errors here
  //       }
  //     );
  //   } else {
  //     // Handle form validation errors if necessary
  //   }
  // }

  // openUserValidateDialog(): void {
  //   const usernamePattern = this.Transferform.value.user; // Get the correct usernamePattern
  //   const dialogRef = this.dialog.open(UserValidateComponent, {
  //     width: 'auto',
  //     data: { usernamePattern }, // Pass the correct usernamePattern
  //   });
  // }


  openUserValidateDialog(): void {
    const usernamePattern = this.Transferform.value.user;
    const qty = this.Transferform.value.quantity;
    const voucher = this.Transferform.value.voucher;
    const selectedVoucherId = this.Transferform.value.voucher;
    // Find the selected voucher object based on the ID
    const selectedVoucher = this.payments.find(payment => payment.id === selectedVoucherId);

    if (selectedVoucher && qty > selectedVoucher?.unit) {
      // Display an error message
      const errorMessage = 'Error! Selected Quantity is more than your selected voucher quantity';
      this.notifyError(errorMessage);
    } else {
      const dialogRef = this.dialog.open(UserValidateComponent, {
        width: 'auto',
        data: { usernamePattern, qty, voucher },

      });

      // Pass the usernamePattern to the dialog
      // dialogRef.componentInstance.usernamePattern = this.Transferform.value.user;
      dialogRef.afterClosed().subscribe((user: Registration | undefined) => {
        if (user) {
          // Set the formControlName "user" value to the selected user's username
          this.Transferform.get('user')?.setValue(user.userName);
          // Update the validation state
          this.isValidated = true;
          this.paymentService.getPymt(this.Transferform.value.voucher).subscribe(data => {
            this.pymt = data;
            localStorage.setItem('pymt', JSON.stringify(this.pymt));
          });
        }
      });
    }
  }

  getServedAlacart() {
    const startControl = '01-09-2023';
    const endControl = '10-20-2023';


    if (startControl && endControl) {
      const startDate = new Date(startControl);
      const endDate = new Date(endControl);

      this.ordmealService.getAlacarteOrders(startDate, endDate).subscribe(data => {
        // this.servedData = data;
        this.showTable = true;
        this.isSubmitClicked = true;
      });
    }
  }


  // exportToCSV() {
  //   // this.getServedAlacart();
  //   // Extract data from the MatTableDataSource
  //   const dataToExport = this.servedData;

  //   // Create a temporary HTML table element
  //   const table = document.createElement('table');

  //   // Define the table headers
  //   const headerRow = table.insertRow(0);
  //   this.displayedColumns.forEach((column, index) => {
  //     const headerCell = headerRow.insertCell(index);
  //     headerCell.innerText = column;
  //   });

  //   // Populate the table with data
  //   dataToExport.forEach((item) => {
  //     const row = table.insertRow();
  //     this.displayedColumns.forEach((column, index) => {
  //       const cell = row.insertCell(index);
  //       cell.innerText = item[column];
  //     });
  //   });

  //   // Create an ElementRef from the HTML table element
  //   const tableElementRef: ElementRef = {
  //     nativeElement: table
  //   };

  //   // Export the table to Excel using the ExportService
  //   this.exportService.exportTableElmToExcel(tableElementRef, 'servedData');
  // }



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
        console.log('Freeze status updated successfully:');
      },
      (error) => {
        console.error('Error updating freeze status:', error);
      }
    );

  }
  getHistoryRecords(ServedBy: number): void {
    this.servedService.getHistoryRecords(ServedBy).subscribe((records: HistoryRecords[]) => {
      console.log('Freeze status updated successfully:', records);
      this.recentTransactions = records;
      console.log('Freeze status updated successfully:', this.recentTransactions);
    });
  }
  formatWithCommas(value: number | null): string {
    if (value === null) {
      return '';
    }

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatter.format(value);
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


  redirectToPayment(): void {
    const userJSON = localStorage.getItem('user');
    const user = JSON.parse(userJSON || '[]'); // Parse the JSON string to an object

    if (user && (user.custTypeId === 1 || user.custTypeId === 5)) {
      // Redirect to /staffpayment if custTypeId is 1 or 5
      this.router.navigate(['/staffpayment']);
    } else {
      // Redirect to /guestpayment for other custTypeIds
      this.router.navigate(['/guestpayment']);
    }

  }
  openContactDialog(): void {
    const dialogRef = this.dialog.open(ContactUsDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  shouldDisplayMeal(mealType: string): boolean {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    if (mealType === 'breakfast' && currentHour >= 9) {
      return false; // Don't display breakfast after 9 AM.
    }

    if (mealType === 'lunch' && currentHour >= 12) {
      return false; // Don't display lunch after 12 PM.
    }

    if (mealType === 'dinner' && currentHour >= 21) {
      return false; // Don't display dinner after 9 PM.
    }

    return true; // Display for other meal types or within the allowed time.
  }



}
