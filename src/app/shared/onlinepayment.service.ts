import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnlinePayment } from './onlinepayment.model';
import { environment } from 'src/environments/environment';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';



export interface OnlinePaymentService {
  id: number;
  TransRefNo: number;
  TransDate: Date;
  Paidby: number;
  AmountPaid: number;
}


@Injectable({
  providedIn: 'root'
})
export class OnlinePaymentService {
  //   private apiUrl = 'https://localhost:7146/OnlinePayment'; 
  private apiUrl = `${this.envUrl.urlAddress}/OnlinePayment`;

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  // Post an online payment
  postOnlinePayment(payment: OnlinePayment): Observable<any> {
    return this.http.post(this.apiUrl, payment);
  }
}

