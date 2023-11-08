import { Component, OnInit, VERSION, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { ServedAlacarteVoucherModel } from './servedAlacartVoucherModel.model';
import { OrderedMealService } from 'src/app/guestpayment/orderedmeal.service';
// import { DateRange } from 'igniteui-angular';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ExportService } from 'src/app/shared/services/export.service';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { formatDate } from "@angular/common";
import { ChartConfiguration, ChartOptions, ChartType } from "chart.js";
import { ServedService } from 'src/app/users-payment-info/served.service';
import { ServedReportModel } from './servedReport.model';
import { ServedSummaryReportModel } from './servedSummaryReport.model';
import { TotalRevenueModel } from './totalRevenue.model';
import { UnservedReportModel } from './unservedReport.model';
import { OnlinePaymentService } from 'src/app/shared/onlinepayment.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CreatemealdialogComponent } from 'src/app/createmealdialog/createmealdialog.component';
import { AvailableMeal } from 'src/app/createmealdialog/availableMeal.model';
import { AvailableMealService } from 'src/app/createmealdialog/available-meal.service';
import { MatChipSelectionChange } from '@angular/material/chips';
import { ConfirmationDialogComponent } from 'src/app/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { MealActivityService } from 'src/app/createmealdialog/meal-activity.service';
import { MealActivity } from 'src/app/createmealdialog/meal-activity.model';


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];






@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit, AfterViewInit {

  dataSource5: AvailableMeal[] = [];
  mealActivity!: MealActivity;
  isActive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  title = 'ng2-charts-demo';

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July'
    ],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        label: 'Series A',
        fill: true,
        tension: 0.5,
        borderColor: 'black',
        backgroundColor: 'rgba(255,0,0,0.3)'
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: false
  };
  public lineChartLegend = true;
  servedData: ServedAlacarteVoucherModel[] = [];
  unservedData: UnservedReportModel[] = [];
  revenueData: TotalRevenueModel[] = [];
  totservedData: ServedReportModel[] = [];
  servedSummaryData: ServedSummaryReportModel[] = [];
  selected = 'option0';
  showTable = false;
  isSubmitClicked = false;
  dateServed: Date = new Date(); // Replace this with your actual date
  form!: FormGroup;
  displayedColumns2: string[] = ['position', 'name', 'weight', 'symbol', 'slide_toggle'];
  dataSource2 = ELEMENT_DATA;
  formattedDate: string;
  dataToDisplay: any;
  selectedChip: string = 'All Meals';

  constructor(private mealActivityService: MealActivityService, private snackBar: MatSnackBar, private availableMealService: AvailableMealService, public dialog: MatDialog, private OnlinePayment: OnlinePaymentService, private Served: ServedService, private fb: FormBuilder, private exportService: ExportService, private _liveAnnouncer: LiveAnnouncer, private ordmealService: OrderedMealService) {



    // Format the date when the component is initialized
    this.formattedDate = this.formatDateForDisplay(this.dateServed);
    this.form = this.fb.group({
      selected: '', // Select field is required
      start: ['', Validators.required],    // Start date is required
      end: ['', Validators.required],      // End date is required
    });
  }
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  displayedColumns5: string[] = ['id', 'mealType', 'mealName', 'description', 'active'];


  displayedColumns: string[] = ['dateServed', 'custTypeName', 'menuName', 'maxTarriff', 'dateEntered'];
  displayedTotalRevenueColumns: string[] = ['transDate', 'username', 'customerType', 'amountPaid'];
  displayedTotalServedColumns: string[] = ['dateServed', 'servedBy', 'customerType', 'voucherDescription', 'amount'];
  displayedTotalServedSummaryColumns: string[] = ['month', 'day', 'voucherDescription', 'totalServedIDs'];
  displayedUnservedReportColumns: string[] = ['enteredByUsername', 'dateEntered', 'voucherDescription', 'servedUnits', 'totalUnits', 'remainingUnits']
  dataSource = new MatTableDataSource<ServedAlacarteVoucherModel>();

  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [100, 200, 300, 40];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('this.dataSource') userTable!: ElementRef;
  @ViewChild('paginator') paginator!: MatPaginator;

  openDialog(): void {
    const dialogRef = this.dialog.open(CreatemealdialogComponent, {
      // data: {name: this.name, animal: this.animal},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.ngOnInit();
      // this.animal = result;
    });
  }
  ngOnInit() {
    this.availableMealService.getAllAvailableMeals().subscribe((meals) => {
      this.dataSource5 = meals;
    });
  }
  showSnackbar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2000, // Duration in milliseconds (2 seconds)
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource = new MatTableDataSource(this.servedData);
    this.dataSource.paginator = this.paginator;
  }

  getActiveMeals() {
    if (this.selectedChip === 'Active Meals') {
      // Call your getActiveMeals service method here
      this.availableMealService.getActiveMeals().subscribe(data => {
        // Handle the data returned by the service
        this.dataSource5 = data;
      });
    }
  }
  getInactiveMeals() {
    if (this.selectedChip === 'Inactive Meals') {
      // Call your getActiveMeals service method here
      this.availableMealService.getInactiveMeals().subscribe(data => {
        // Handle the data returned by the service
        this.dataSource5 = data;
      });
    }
  }
  getAllMeals() {
    if (this.selectedChip === 'All Meals') {
      // Call your getActiveMeals service method here
      this.availableMealService.getAllAvailableMeals().subscribe(data => {
        // Handle the data returned by the service
        this.dataSource5 = data;
      });
    }
  }


  handlePage(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;

    // Update the data to display based on startIndex and endIndex
    this.dataToDisplay = this.servedData.slice(startIndex, endIndex);
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


  private formatDateForDisplay(date: Date): string {
    // Format the date as 'yyyy-MM-dd HH:mm:ss' (adjust the format as needed)
    return formatDate(date, 'yyyy-MM-dd HH:mm:ss', 'en-US');
  }




  get totalPages(): number {
    return Math.ceil(this.servedData.length / this.pageSize);
  }
  get startIndex(): number {
    return this.currentPage * this.pageSize;
  }
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
  }
  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.servedData.length);
  }
  getCurrentPageData(): any[] {
    return this.servedData.slice(this.startIndex, this.endIndex);
  }



  onSubmit() {
    const startControl = this.range.get('start');
    const endControl = this.range.get('end');

    if (startControl && endControl) {
      const startDate = startControl.value;
      const endDate = new Date(endControl.value);


      const formattedEndDate = endDate.toISOString().split('T')[0];

      startDate.setHours(1, 0, 0);

      endDate.setHours(23, 59, 59);
      endDate.setDate(endDate.getDate() + 1);

      if (!this.selected || this.selected === 'option0') {
        // Display message when option0 is selected or none is selected
        this.showTable = false;
        this.isSubmitClicked = true;
        return;
      } else {
        if (this.selected === 'option1') {
          this.OnlinePayment.getTotalRevenue(startDate, endDate).subscribe((data) => {
            this.revenueData = data;
            //console.log('record', data);
            this.showTable = true;
            this.isSubmitClicked = true;
          });
        } else if (this.selected === 'option2') {
          // this.fetchTotalVouchersCount(startDate, endDate);
        } else if (this.selected === 'option3') {
          // Fetch data based on selected option and date range
          this.ordmealService.getAlacarteOrders(startDate, endDate).subscribe((data) => {
            this.servedData = data;
            this.showTable = true;
            this.isSubmitClicked = true;
          });
        } else if (this.selected === 'option4') {
          this.Served.getServedReport(startDate, endDate).subscribe((data) => {
            this.totservedData = data;
            this.showTable = true;
            this.isSubmitClicked = true;
          });
        } else if (this.selected === 'option5') {
          this.Served.getServedSummaryReport(startDate, endDate).subscribe((data) => {
            this.servedSummaryData = data;
            //console.log('record', data);
            this.showTable = true;
            this.isSubmitClicked = true;
          });
        } else if (this.selected === 'option6') {
          this.Served.getUnservedReport(startDate, endDate).subscribe((data) => {
            this.unservedData = data;
            //console.log('record', data);
            this.showTable = true;
            this.isSubmitClicked = true;
          });
        }
      }
    }
  }

  getServedAlacart() {
    const startControl = this.range.get('start');
    const endControl = this.range.get('end');

    if (startControl && endControl) {
      const startDate = startControl.value;
      const endDate = endControl.value;

      this.ordmealService.getAlacarteOrders(startDate, endDate).subscribe(data => {
        this.servedData = data;
        this.showTable = true;
        this.isSubmitClicked = true;
      });
    }
  }



  exportToCSV() {
    if (this.selected === 'option1') {
      this.exportTotalRevenueToCSV();
    } else if (this.selected === 'option2') {
      this.exportTotalVouchersCountToCSV();
    } else if (this.selected === 'option3') {
      this.exportServedAlaCarteToCSV();
    } else if (this.selected === 'option4') {
      this.exportServedVouchersReportsToCSV();
    } else if (this.selected === 'option5') {
      this.exportServedSummaryReportToCSV();
    } else if (this.selected === 'option6') {
      this.exportRemainingUnservedToCSV();
    }
  }

  exportTotalRevenueToCSV() {
    // Extract data from the MatTableDataSource
    const dataToExport = this.revenueData;

    // Create a temporary HTML table element
    const table = document.createElement('table');

    // Define the table headers
    const headerRow = table.insertRow(0);
    this.displayedTotalRevenueColumns.forEach((column, index) => {
      const headerCell = headerRow.insertCell(index);
      headerCell.innerText = column;
    });

    // Populate the table with data
    dataToExport.forEach((item) => {
      const row = table.insertRow();
      this.displayedTotalRevenueColumns.forEach((column, index) => {
        const cell = row.insertCell(index);
        cell.innerText = item[column];
      });
    });

    // Create an ElementRef from the HTML table element
    const tableElementRef: ElementRef = {
      nativeElement: table
    };

    // Export the table to Excel using the ExportService
    this.exportService.exportTableElmToExcel(tableElementRef, 'servedData');

  }
  toggleMealStatus(element: AvailableMeal) {
    let message: string;
    let action: () => void;
    const userJSON = localStorage.getItem('user');
    const user = JSON.parse(userJSON || '[]');
    const mealActivity = new MealActivity;

    // if (user && (user.custTypeId === 1 || user.custTypeId === 5)) {
    //   // Redirect to /staffpayment if custTypeId is 1 or 5
    //   this.router.navigate(['/staffpayment']);
    // } else {
    //   // Redirect to /guestpayment for other custTypeIds
    //   this.router.navigate(['/guestpayment']);
    // }


    if (element.active) {
      message = 'Do you want to deactivate this item?';
      action = () => {
        if (user) {
          mealActivity.availableMealId = element.id;
          mealActivity.madeActiveDate = new Date('01-01-2001');
          mealActivity.madeActiveBy = '0'; // You should replace this with the actual user ID.
          mealActivity.madeInactiveDate = new Date();
          mealActivity.madeInactiveBy = user.id.toString();
        }




        // Create a MealActivity record
        this.mealActivityService.createMealActivity(mealActivity).subscribe(() => {
          // Deactivate the meal
          element.active = false;

          console.log(mealActivity);
          this.availableMealService.updateAvailableMeal(element).subscribe(() => {
            this.showSnackbar('Successfully deactivated');
          });
        });
      };
    } else {
      message = 'Do you want to activate this item?';
      action = () => {
        if (user) {
          mealActivity.availableMealId = element.id;
          mealActivity.madeActiveDate = new Date();
          mealActivity.madeActiveBy = user.id.toString(); // You should replace this with the actual user ID.
          mealActivity.madeInactiveDate = new Date('01-01-2001');
          mealActivity.madeInactiveBy = '0';
        }



        // Create a MealActivity record
        this.mealActivityService.createMealActivity(mealActivity).subscribe(() => {
          // Activate the meal
          element.active = true;

          this.availableMealService.updateAvailableMeal(element).subscribe(() => {
            this.showSnackbar('Successfully activated');
          });
        });
      };
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // User confirmed, perform the action
        action();
      } else if (this.selectedChip === 'All Meals') {
        this.getAllMeals();
      } else if (this.selectedChip === 'Active Meals') {
        this.getActiveMeals();
      } else if (this.selectedChip === 'Inactive Meals') {
        this.getInactiveMeals();
      }
    });
  }

  exportTotalVouchersCountToCSV() {
    // // Extract data from the MatTableDataSource
    // const dataToExport = this.servedSummaryData;

    // // Create a temporary HTML table element
    // const table = document.createElement('table');

    // // Define the table headers
    // const headerRow = table.insertRow(0);
    // this.displayedTotalServedSummaryColumns.forEach((column, index) => {
    //   const headerCell = headerRow.insertCell(index);
    //   headerCell.innerText = column;
    // });

    // // Populate the table with data
    // dataToExport.forEach((item) => {
    //   const row = table.insertRow();
    //   this.displayedTotalServedSummaryColumns.forEach((column, index) => {
    //     const cell = row.insertCell(index);
    //     cell.innerText = item[column];
    //   });
    // });

    // // Create an ElementRef from the HTML table element
    // const tableElementRef: ElementRef = {
    //   nativeElement: table
    // };

    // // Export the table to Excel using the ExportService
    // this.exportService.exportTableElmToExcel(tableElementRef, 'servedData');



  }




  exportServedVouchersReportsToCSV() {

    // Extract data from the MatTableDataSource
    const dataToExport = this.totservedData;

    // Create a temporary HTML table element
    const table = document.createElement('table');

    // Define the table headers
    const headerRow = table.insertRow(0);
    this.displayedTotalServedColumns.forEach((column, index) => {
      const headerCell = headerRow.insertCell(index);
      headerCell.innerText = column;
      //console.log('x:', headerCell.innerText);
    });

    // Populate the table with data
    dataToExport.forEach((item) => {
      const row = table.insertRow();
      this.displayedTotalServedColumns.forEach((column, index) => {
        const cell = row.insertCell(index);
        cell.innerText = item[column];
        //console.log('y:', cell.innerText);
      });
    });

    // Create an ElementRef from the HTML table element
    const tableElementRef: ElementRef = {
      nativeElement: table
    };

    // Export the table to Excel using the ExportService
    this.exportService.exportTableElmToExcel(tableElementRef, 'servedData');

  }

  exportServedSummaryReportToCSV() {
    // Extract data from the MatTableDataSource
    const dataToExport = this.servedSummaryData;

    // Create a temporary HTML table element
    const table = document.createElement('table');

    // Define the table headers
    const headerRow = table.insertRow(0);
    this.displayedTotalServedSummaryColumns.forEach((column, index) => {
      const headerCell = headerRow.insertCell(index);
      headerCell.innerText = column;
    });

    // Populate the table with data
    dataToExport.forEach((item) => {
      const row = table.insertRow();
      this.displayedTotalServedSummaryColumns.forEach((column, index) => {
        const cell = row.insertCell(index);
        cell.innerText = item[column];
      });
    });

    // Create an ElementRef from the HTML table element
    const tableElementRef: ElementRef = {
      nativeElement: table
    };

    // Export the table to Excel using the ExportService
    this.exportService.exportTableElmToExcel(tableElementRef, 'servedData');

  }


  exportServedAlaCarteToCSV() {
    // this.getServedAlacart();
    // Extract data from the MatTableDataSource
    const dataToExport = this.servedData;

    // Create a temporary HTML table element
    const table = document.createElement('table');

    // Define the table headers
    const headerRow = table.insertRow(0);
    this.displayedColumns.forEach((column, index) => {
      const headerCell = headerRow.insertCell(index);
      headerCell.innerText = column;

    });

    // Populate the table with data
    dataToExport.forEach((item) => {
      const row = table.insertRow();
      this.displayedColumns.forEach((column, index) => {
        const cell = row.insertCell(index);
        cell.innerText = item[column];
      });
    });

    // Create an ElementRef from the HTML table element
    const tableElementRef: ElementRef = {
      nativeElement: table
    };

    // Export the table to Excel using the ExportService
    this.exportService.exportTableElmToExcel(tableElementRef, 'servedData');
  }

  exportRemainingUnservedToCSV() {
    // this.getServedAlacart();
    // Extract data from the MatTableDataSource
    const dataToExport = this.unservedData;

    // Create a temporary HTML table element
    const table = document.createElement('table');

    // Define the table headers
    const headerRow = table.insertRow(0);
    this.displayedUnservedReportColumns.forEach((column, index) => {
      const headerCell = headerRow.insertCell(index);
      headerCell.innerText = column;

    });

    // Populate the table with data
    dataToExport.forEach((item) => {
      const row = table.insertRow();
      this.displayedUnservedReportColumns.forEach((column, index) => {
        const cell = row.insertCell(index);
        cell.innerText = item[column];
      });
    });

    // Create an ElementRef from the HTML table element
    const tableElementRef: ElementRef = {
      nativeElement: table
    };

    // Export the table to Excel using the ExportService
    this.exportService.exportTableElmToExcel(tableElementRef, 'servedData');
  }

  public formatDate(date: Date, format: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24-hour format
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }


}
