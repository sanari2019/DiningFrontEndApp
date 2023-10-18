import { Component, OnInit, VERSION, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
// import { Component, OnInit } from '@angular/core';
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
  isHandset: boolean = false; // Add a property to track handset breakpoint



  private observeHandsetBreakpoint(): void {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(untilDestroyed(this))
      .subscribe((state) => {
        this.isHandset = state.matches;
      });
  }

  constructor(public dialog: MatDialog,
    private fb: FormBuilder, private exportService: ExportService, private _liveAnnouncer: LiveAnnouncer,
    private breakpointObserver: BreakpointObserver,
    private servedService: ServedService,
    private registrationService: RegistrationService,
    private ordmealService: OrderedMealService,
    private paymentDetailService: PaymentDetailService,
    private voucherService: VoucherService) {
    this.form = this.fb.group({
      // selected: '', // Select field is required
      start: ['', Validators.required],    // Start date is required
      end: ['', Validators.required],      // End date is required
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
      this.ServedBy = loggedInUser.id;
      // this.getHistoryRecords(this.ServedBy);
      this.getUser(loggedInUser.id);
      // Fetch the payment details for the logged-in user
      this.paymentDetailService.getPaidPaymentsByCust(loggedInUser).subscribe((payments: Payment[]) => {
        // Calculate totalAmount from the payment details
        this.totalAmount = payments.reduce((sum, payment) => sum + (payment.unit * payment.amount), 0);
        this.servedService.getHistoryRecords(this.ServedBy).subscribe((data: HistoryRecords[]) => {
          this.servedData = data;
          console.log('x:', data);
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


  }


  onSubmit() {
    const startControl = this.range.get('start');
    const endControl = this.range.get('end');

    if (startControl && endControl) {
      const startDate = startControl.value;
      const endDate = endControl.value;

      endDate.setHours(23, 59, 59);

      if (!this.selected || this.selected === 'option0') {
        // Display message when option0 is selected or none is selected
        this.showTable = false;
        this.isSubmitClicked = true;
        return;
      } else {
        // Fetch data based on selected option and date range
        this.ordmealService.getAlacarteOrders(startDate, endDate).subscribe((data) => {
          // this.servedData = data;
          this.showTable = true;
          this.isSubmitClicked = true;
        });
      }
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
        console.log('Freeze status updated successfully:', updatedUser);
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





}
