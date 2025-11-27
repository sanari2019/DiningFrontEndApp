import { Component, OnInit, VERSION, ElementRef, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
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
import { catchError, map, switchMap, finalize } from 'rxjs/operators';
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
import { PaystackOptions } from 'angular4-paystack';
import { OnlinePayment } from 'src/app/shared/onlinepayment.model';
import { OnlinePaymentService } from 'src/app/shared/onlinepayment.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@UntilDestroy()
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
    freeze: false,
    autolock: false
  };
  r_user!: Registration;
  isHandset: boolean = false; // Add a property to track handset breakpoint
  isValidated: boolean = false;
  contactOption: boolean = false;
  transferTransaction!: TransferTransaction;
  pymtid: number = 0;
  activityRange: 'today' | '7d' | '1m' = 'today';
  filteredRecentTransactions: HistoryRecords[] = [];
  showAllActivity = false;
  pageSize = 8;
  @ViewChild('addMoneyDialog') addMoneyDialog!: TemplateRef<any>;
  @ViewChild('buyVoucherDialog') buyVoucherDialog!: TemplateRef<any>;
  @ViewChild('buyMealDialog') buyMealDialog!: TemplateRef<any>;
  @ViewChild('disputeDialog') disputeDialog!: TemplateRef<any>;
  @ViewChild('feedbackDialog') feedbackDialog!: TemplateRef<any>;
  amountControl = new FormControl(0, [Validators.min(0)]);
  quickAmounts = [100, 200, 500, 800, 1000];
  allVouchers: Voucher[] = [];
  voucherSearchTerm = '';
  voucherQuantityMap: { [key: number]: number } = {};
  voucherCart: { id: number; qty: number }[] = [];
  voucherCurrentPage: number = 1;
  voucherPageSize: number = 4;
  mealSearchTerm = '';
  mealQuantityMap: { [key: string]: number } = {};
  mealCart: { key: string; qty: number }[] = [];
  fallbackMeals: AvailableMeal[] = [
    { mealName: 'Sunrise Pancakes', mealType: 'breakfast' } as AvailableMeal,
    { mealName: 'Grilled Chicken Bowl', mealType: 'lunch' } as AvailableMeal,
    { mealName: 'Roasted Veggie Pasta', mealType: 'dinner' } as AvailableMeal
  ];
  mealsLoaded = false;
  disputeForm: FormGroup = this.fb.group({
    paymentMethod: ['', Validators.required],
    description: ['', Validators.required],
  });
  paystackOptions: PaystackOptions = {
    amount: 0,
    email: '',
    ref: '',
    metadata: {}
  };
  isProcessingPayment = false;



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
    private voucherService: VoucherService,
    private onlinePaymentService: OnlinePaymentService,
    private snackBar: MatSnackBar) {

    this.Transferform = this.fb.group({
      voucher: [null, Validators.required],
      user: ['', Validators.required],
      quantity: [null, Validators.required],
    });
    this.Feedbackform = this.fb.group({
      supportType: ['feedback', Validators.required],
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

    // Set responsive voucher page size
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(untilDestroyed(this))
      .subscribe((state) => {
        this.voucherPageSize = state.matches ? 1 : 4;
      });

    // Fetch the logged-in user from local storage
    const loggedInUserData = localStorage.getItem('user');
    const storedUserData = localStorage.getItem('user_data');

    if (loggedInUserData || storedUserData) {
      const loggedInUser = loggedInUserData ? JSON.parse(loggedInUserData) : {};
      const userData = storedUserData ? JSON.parse(storedUserData) : {};

      this.user.firstName = loggedInUser.firstName || userData.firstName || '';
      this.user.lastName = loggedInUser.lastName || userData.lastName || '';
      this.user.freeze = loggedInUser.freeze ?? userData.freeze ?? false;
      this.freezeStatus = this.user.freeze;
      this.ServedBy = loggedInUser.id || userData.id || loggedInUser.userId || 0;
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
      this.mealsLoaded = true;
    }, () => {
      this.mealsLoaded = true;
    });

    // Load all vouchers for the buy voucher dialog
    this.voucherService.getVouchers().subscribe({
      next: (vouchers) => {
        this.allVouchers = vouchers || [];
      },
      error: (err) => {
        console.error('Error loading vouchers:', err);
        this.allVouchers = [];
      }
    });

    this.filterRecentTransactions();
    this.initPaystackOptions();
    this.amountControl.valueChanges.pipe(untilDestroyed(this)).subscribe(val => this.updatePaystackOptions(val || 0));
  }

  notifyError(message: any): void {
    this.notificationService.error(message);
  }

  notifySuccess(message: any): void {
    this.notificationService.success(message);
  }

  postFeedback() {
    const experienceback = this.Feedbackform.value.experience;
    const supportType = this.Feedbackform.value.supportType || 'feedback';
    const UserJSON = localStorage.getItem('user');

    if (this.Feedbackform.valid && UserJSON) {
      const fUser = JSON.parse(UserJSON);
      const feedback: Feedback = {
        id: 0,
        userId: fUser.id,
        experience: experienceback,
        contactOption: this.contactOption,
        supportType: supportType
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
    this.freezeStatus = this.user.freeze;

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      localStorage.setItem('user', JSON.stringify({ ...parsed, freeze: this.user.freeze }));
    }

    this.registrationService.updateUser(this.user).subscribe(
      () => {
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
      this.filterRecentTransactions();
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

  getVoucherTypesCount(): number {
    return this.totalAmountByVoucherId ? Object.keys(this.totalAmountByVoucherId).length : 0;
  }

  getMealCount(): number {
    if (!this.activeMeals) {
      return 0;
    }
    return this.activeMeals.filter(meal => this.shouldDisplayMeal(meal.mealType)).length;
  }

  filterRecentTransactions(): void {
    const now = new Date();
    this.filteredRecentTransactions = (this.recentTransactions || []).filter(tx => {
      const txDate = tx.DateServed ? new Date(tx.DateServed) : null;
      if (!txDate) {
        return false;
      }
      if (this.activityRange === 'today') {
        return txDate.toDateString() === now.toDateString();
      }
      if (this.activityRange === '7d') {
        const diff = now.getTime() - txDate.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      }
      if (this.activityRange === '1m') {
        const diff = now.getTime() - txDate.getTime();
        return diff <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
    this.showAllActivity = false;
  }

  get visibleRecentTransactions(): HistoryRecords[] {
    if (this.showAllActivity) {
      return this.filteredRecentTransactions;
    }
    return this.filteredRecentTransactions.slice(0, this.pageSize);
  }

  toggleActivityView(): void {
    this.showAllActivity = !this.showAllActivity;
  }

  openAddMoneyDialog(): void {
    if (this.addMoneyDialog) {
      this.dialog.open(this.addMoneyDialog, {
        width: '420px',
        panelClass: 'add-money-dialog-panel'
      });
    }
  }

  addQuickAmount(amount: number): void {
    const current = this.amountControl.value || 0;
    this.amountControl.setValue(current + amount);
  }

  clearAmount(): void {
    this.amountControl.setValue(0);
  }

  payWithPaystack(): void {
    this.redirectToPayment();
  }

  payWithSquad(): void {
    this.redirectToPayment();
  }

  openBuyVoucherDialog(): void {
    if (this.buyVoucherDialog) {
      this.dialog.open(this.buyVoucherDialog, {
        width: '600px',
        panelClass: 'add-money-dialog-panel'
      });
    }
  }

  filteredVouchers(): Voucher[] {
    if (!this.allVouchers || this.allVouchers.length === 0) {
      return [];
    }

    if (!this.voucherSearchTerm) {
      return this.allVouchers;
    }

    const term = this.voucherSearchTerm.toLowerCase();
    return this.allVouchers.filter(voucher => {
      return (
        voucher.id.toString().includes(term) ||
        voucher.amount.toString().includes(term) ||
        voucher.description.toLowerCase().includes(term) ||
        voucher.custname.toLowerCase().includes(term)
      );
    });
  }

  onVoucherSearchChange(): void {
    this.voucherCurrentPage = 1; // Reset to first page when search changes
  }

  paginatedVouchers(): Voucher[] {
    const filtered = this.filteredVouchers();
    const startIndex = (this.voucherCurrentPage - 1) * this.voucherPageSize;
    const endIndex = startIndex + this.voucherPageSize;
    return filtered.slice(startIndex, endIndex);
  }

  getTotalVoucherPages(): number {
    const filtered = this.filteredVouchers();
    return Math.ceil(filtered.length / this.voucherPageSize);
  }

  voucherPreviousPage(): void {
    if (this.voucherCurrentPage > 1) {
      this.voucherCurrentPage--;
    }
  }

  voucherNextPage(): void {
    if (this.voucherCurrentPage < this.getTotalVoucherPages()) {
      this.voucherCurrentPage++;
    }
  }

  changeVoucherQty(id: number, delta: number): void {
    const current = this.voucherQuantityMap[id] || 0;
    const next = Math.max(0, current + delta);
    this.voucherQuantityMap[id] = next;
  }

  addVoucherToCart(id: number): void {
    const qty = this.voucherQuantityMap[id] || 0;
    if (qty <= 0) return;
    const existing = this.voucherCart.find(v => v.id === id);
    if (existing) {
      existing.qty = qty;
    } else {
      this.voucherCart.push({ id, qty });
    }
  }

  openOrderMealDialog(): void {
    if (this.buyMealDialog) {
      this.dialog.open(this.buyMealDialog, {
        width: '600px',
        panelClass: 'add-money-dialog-panel'
      });
    }
  }

  filteredMeals(): AvailableMeal[] {
    if (!this.activeMeals) {
      return [];
    }
    const term = this.mealSearchTerm.toLowerCase();
    return this.activeMeals.filter(meal => {
      const matchesType = this.shouldDisplayMeal(meal.mealType);
      const matchesTerm = !term || meal.mealName.toLowerCase().includes(term) || meal.mealType.toLowerCase().includes(term);
      return matchesType && matchesTerm;
    });
  }

  changeMealQty(key: string, delta: number): void {
    const current = this.mealQuantityMap[key] || 0;
    const next = Math.max(0, current + delta);
    this.mealQuantityMap[key] = next;
  }

  addMealToCart(key: string): void {
    const qty = this.mealQuantityMap[key] || 0;
    if (qty <= 0) return;
    const existing = this.mealCart.find(m => m.key === key);
    if (existing) {
      existing.qty = qty;
    } else {
      this.mealCart.push({ key, qty });
    }
  }

  getMealImage(mealType: string): string {
    const type = (mealType || '').toLowerCase();
    if (type.includes('breakfast')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=60';
    }
    if (type.includes('lunch')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=60';
    }
    if (type.includes('dinner')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=60';
    }
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=60';
  }

  openDisputeDialog(): void {
    if (this.disputeDialog) {
      this.dialog.open(this.disputeDialog, {
        width: '420px',
        panelClass: 'add-money-dialog-panel'
      });
    }
  }

  submitDispute(): void {
    if (this.disputeForm.valid) {
      // Placeholder for API submission
      console.log('Dispute submitted', this.disputeForm.value);
      this.disputeForm.reset();
    }
  }

  resetDispute(): void {
    this.disputeForm.reset();
  }

  openFeedbackDialog(): void {
    if (this.feedbackDialog) {
      this.dialog.open(this.feedbackDialog, {
        width: '480px',
        panelClass: 'add-money-dialog-panel'
      });
    }
  }

  submitFeedback(): void {
    if (this.Feedbackform.valid) {
      this.postFeedback();
    }
  }

  initPaystackOptions(): void {
    const userJSON = localStorage.getItem('user');
    const userDataJSON = localStorage.getItem('user_data');
    const u = userJSON ? JSON.parse(userJSON) : {};
    const u2 = userDataJSON ? JSON.parse(userDataJSON) : {};
    const email = u.userName || u2.userName || u.email || u2.email || '';
    const userId = u.id || u2.id || 0;
    this.paystackOptions = {
      amount: (this.amountControl.value || 0) * 100,
      email,
      ref: this.generateTransactionRef(),
      metadata: {
        user_id: userId,
        payment_type: 'wallet_topup'
      }
    };
  }

  updatePaystackOptions(amount: number): void {
    this.paystackOptions = {
      ...this.paystackOptions,
      amount: Math.max(0, amount) * 100,
      ref: this.generateTransactionRef()
    };
  }

  generateTransactionRef(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let ref = '';
    for (let i = 0; i < 12; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
  }

  paymentInit(): void {
    // placeholder for paystack init
  }

  paymentDone(event: any): void {
    const reference = event?.reference || event?.ref;
    const amount = this.amountControl.value || 0;
    const userJSON = localStorage.getItem('user');
    const userDataJSON = localStorage.getItem('user_data');
    const u = userJSON ? JSON.parse(userJSON) : {};
    const u2 = userDataJSON ? JSON.parse(userDataJSON) : {};
    const userId = u.id || u2.id || 0;

    if (!reference) {
      this.snackBar.open('Unable to verify payment reference.', 'Dismiss', { duration: 3000 });
      return;
    }

    const walletPayment = new Payment();
    walletPayment.amount = amount;
    walletPayment.unit = 1;
    walletPayment.voucherId = 0;
    walletPayment.paymentType = 3; // wallet top-up
    walletPayment.paid = true;
    walletPayment.timepaid = new Date();
    walletPayment.dateEntered = new Date();
    walletPayment.paymentmodeid = 3; // paystack
    walletPayment.custCode = u.custId || u2.custId || '';
    walletPayment.custtypeid = u.custTypeId || u2.custTypeId || 0;
    walletPayment.enteredBy = (userId || '').toString();

    const payment: OnlinePayment = {
      id: 0,
      TransRefNo: reference,
      TransDate: new Date(),
      Paidby: userId,
      AmountPaid: amount,
      PymtTypeid: 3 // wallet funding
    };

    this.isProcessingPayment = true;
    this.onlinePaymentService.verifyPaystackTransaction(reference).pipe(
      switchMap((verification) => {
        const verifiedAmount = ((verification?.data?.amount ?? amount * 100) / 100);
        payment.AmountPaid = verifiedAmount;
        walletPayment.amount = verifiedAmount;
        const emptyPayment = new Payment();
        return this.onlinePaymentService.postOnlinePayment(emptyPayment, payment, [], [walletPayment]);
      }),
      finalize(() => this.isProcessingPayment = false)
    ).subscribe({
      next: () => {
        this.snackBar.open('Wallet funded successfully.', 'Dismiss', { duration: 3000 });
        this.totalAmount = (this.totalAmount || 0) + (amount || 0);
        this.amountControl.setValue(0);
        this.updatePaystackOptions(0);
      },
      error: (err) => {
        console.error('Payment recording failed', err);
        this.snackBar.open('Payment verified but could not be recorded. Please contact support.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  paymentCancel(): void {
    console.log('Paystack closed');
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
