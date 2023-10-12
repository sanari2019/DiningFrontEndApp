import { Component, OnInit, VERSION, ElementRef, ViewChild } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { ServedAlacarteVoucherModel } from 'src/app/shared/servedAlacartVoucherModel.model';
import { OrderedMealService } from 'src/app/guestpayment/orderedmeal.service';
// import { DateRange } from 'igniteui-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {
  servedData: ServedAlacarteVoucherModel[] = [];



  constructor(private ordmealService: OrderedMealService) { }

  ngOnInit(): void {
    const startDate = new Date('2023-9-01'); // Replace with your desired start date
    const endDate = new Date('2023-9-31'); // Replace with your desired end date

    this.ordmealService.getAlacarteOrders(startDate, endDate).subscribe(data => {
      this.servedData = data;
    });
  }
  getDater(data: any) {
    console.log(data);
  }

  getServedAlacart() {
    const startDate = new Date('2023-10-01'); // Replace with your desired start date
    const endDate = new Date('2023-10-31'); // Replace with your desired end date

    this.ordmealService.getAlacarteOrders(startDate, endDate).subscribe(data => {
      this.servedData = data;
    });
  }
}
