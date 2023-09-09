import { Injectable } from '@angular/core';
import { PaymentByCust } from './PaymentByCust.model';
import { PaymentDetail } from './paymentdetail.model';
import { HttpClient, HttpClientModule, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { Payment } from '../staffpayment/payment.model';
import { Registration } from '../registration/registration.model';
import { RecentTransaction } from '../pages/home/recent-transaction.model';

@Injectable({
  providedIn: 'root'
})

export class PaymentDetailService {

  private PaymentDetailURL = `${this.envUrl.urlAddress}/paymentDetails`;
  private PaymentmainURL = `${this.envUrl.urlAddress}/paymentmain`;
  private paymentdetail = PaymentDetail;

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  getPaidPayments(): Observable<PaymentDetail[]> {
    const url = `${this.envUrl.urlAddress}/PaymentMain/getpaidpymts`;
    return this.http.get<PaymentDetail[]>(url)
  }
  getPaymentDetails(): Observable<PaymentDetail[]> {
    return this.http.get<PaymentDetail[]>(this.PaymentDetailURL)
  }
  getPaidPaymentsByCust(paymentByCust: Registration): Observable<Payment[]> {
    const url = `${this.envUrl.urlAddress}/PaymentMain/getpaidpymtsbyCust`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // return this.http.get<Registration>(url)
    return this.http.post<Payment[]>(url, JSON.stringify(paymentByCust), { headers });
  }

  getPaidPaymentsWithVoucherDescription(userId: string): Observable<Payment[]> {
    const url = `${this.envUrl.urlAddress}/paymentmain/getpaidpymtsbyCustwithVD`;
    return this.http.post<Payment[]>(url, { id: userId });
  }

  // getPaidPaymentsByCust(paymentByCust: PaymentByCust): Observable<Payment[]> {
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   const url = `${this.envUrl.urlAddress}/PaymentMain/getpaidpymtsbyCust`;
  //   return this.http.post<Payment[]>(url,paymentByCust);
  // }





  getPaymentDetailsByUserId(userId: number): Observable<PaymentDetail[]> {
    const url = `${this.envUrl.urlAddress}/PaymentDetails/${userId}`;
    return this.http.get<PaymentDetail[]>(url)
  }
  removePymtdetails(pymtMain: Payment): Observable<{}> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.envUrl.urlAddress}/PaymentMain/deletepymtmain`;
    return this.http.post<Payment>(url, pymtMain)
      .pipe(
        tap(data => console.log('deletePayment: ' + pymtMain.id)),
        catchError(this.handleError)
      );
  }


  getPymtdetailsdata(data: PaymentDetail[]) {
    console.log(JSON.stringify(data))
  }


  updatePaymentDetails(paymentdetail: PaymentDetail): Observable<PaymentDetail> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.PaymentmainURL}/${paymentdetail.id}`;
    return this.http.put<PaymentDetail>(url, paymentdetail, { headers })
      .pipe(
        tap(() => console.log('updatePaymentDetail: ' + paymentdetail.id)),
        map(() => paymentdetail),
        catchError(this.handleError)
      );
  }

  private handleError(err: { error: { message: any; }; status: any; body: { error: any; }; }): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage!: string;
    if (err.error && err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status!}: ${err.body?.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}



