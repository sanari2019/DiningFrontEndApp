import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnlinePayment } from './onlinepayment.model';



export interface OnlinePayment {
    id: number;
    TransRefNo: string;
    TransDate: number;
    Paidby: number;
    AmountPaid: string;
}


@Injectable({
  providedIn: 'root'
})
export class OnlinePaymentService {
  private apiUrl = 'https://localhost:7146/OnlinePayment'; 

  constructor(private http: HttpClient) { }

  // Post an online payment
  postOnlinePayment(payment: OnlinePayment): Observable<any> {
    return this.http.post(this.apiUrl, payment);
  }
}

