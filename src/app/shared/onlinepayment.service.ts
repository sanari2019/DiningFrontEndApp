import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnlinePayment } from './onlinepayment.model';
import { environment } from 'src/environments/environment';



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
  private apiUrl = `${environment.urlAddress}/OnlinePayment`;

  constructor(private http: HttpClient) { }

  // Post an online payment
  postOnlinePayment(payment: OnlinePayment): Observable<any> {
    return this.http.post(this.apiUrl, payment);
  }
}

