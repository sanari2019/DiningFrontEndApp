import { Component, OnInit, VERSION, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { ServedAlacarteVoucherModel } from './servedAlacartVoucherModel.model';
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
import { ChartConfiguration, ChartOptions, ChartType } from "chart.js";







@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements AfterViewInit {
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
  selected = 'option0';
  showTable = false;
  isSubmitClicked = false;
  dateServed: Date = new Date(); // Replace this with your actual date
  form!: FormGroup;

  formattedDate: string;

  constructor(private fb: FormBuilder, private exportService: ExportService, private _liveAnnouncer: LiveAnnouncer, private ordmealService: OrderedMealService) {
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

  displayedColumns: string[] = ['dateServed', 'custTypeName', 'menuName', 'maxTarriff', 'dateEntered'];
  dataSource = new MatTableDataSource<ServedAlacarteVoucherModel>();

  pageSize = this.servedData.length;
  currentPage = 0;
  pageSizeOptions: number[] = [100, 200, 300, 40];

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
          this.servedData = data;
          this.showTable = true;
          this.isSubmitClicked = true;
        });
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
