import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnlinePayment } from './onlinepayment.model';
import { environment } from 'src/environments/environment';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { TotalRevenueModel } from '../pages/Administration/totalRevenue.model';
import { catchError, retry, tap } from 'rxjs/operators';



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
  verifyTransaction(reference: string): Observable<any> {
    const url = `https://api.paystack.co/transaction/verify/${reference}`;
    const secretKey = 'sk_test_c35634b6a8685736ba950f5dbb0492ebeb4257f9'; // Replace with your actual secret key

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${secretKey}`
    });

    return this.http.get(url, { headers }).pipe(
      tap(data => console.log('Transaction verification successful: ', data)),
      catchError(this.handleError)
    );
  }
  checkRef(reference: string): Observable<any> {
    const url = `${this.apiUrl}/GetOnlinePaymentByRefNo/${reference}`;
    return this.http.get(url);
  }
  getTotalRevenue(startDate: Date, endDate: Date): Observable<TotalRevenueModel[]> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    return this.http.get<TotalRevenueModel[]>(`${this.apiUrl}/TotalRevenue`, { params });
  }
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return new Observable<never>();
  }

}

