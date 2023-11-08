import { Injectable } from '@angular/core';
import { Payment } from './payment.model';
import { HttpClient, HttpClientModule, HttpHeaders } from "@angular/common/http";
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { PaymentDetail } from '../users-payment-info/paymentdetail.model';
import { Served } from '../users-payment-info/served.model';

@Injectable({
  providedIn: 'root'
})

export class PaymentService {

  private pymtURL = "";
  //"https://localhost:7146/paymentmain";
  // private userURL1 = "http://localhost:5057/";
  private pymt = Payment;
  //private handleError="";

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  getPayment(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.envUrl.urlAddress + '/paymentmain')
    // .pipe(
    //   tap(data => this.getUserdata(data)),
    //   catchError(this.handleError)
    // );
  }

  getPaymentDetailsByUserId(userId: number): Observable<PaymentDetail[]> {
    const url = `${this.envUrl.urlAddress}/PaymentDetails/${userId}`;
    return this.http.get<PaymentDetail[]>(url)
  }

  getPymtdata(data: Payment[]) {
    console.log(JSON.stringify(data))
  }

  getUser(id: number): Observable<Payment> {
    if (id === 0) {
      return of(this.initializePayment());
    }
    const url = `${this.envUrl.urlAddress + '/paymentmain'}/${id}`;
    return this.http.get<Payment>(url)
      .pipe(
        tap(data => console.log('getPayment: ' + JSON.stringify(data))),
        catchError(this.handleError)
      )
  }
  getPymt(id: number): Observable<Payment> {
    if (id === 0) {
      return of(this.initializePayment());
    }
    const url = `${this.envUrl.urlAddress}/paymentmain/getpymt/${id}`;
    return this.http.get<Payment>(url)
      .pipe(
        tap(data => console.log('getPayment: ' + JSON.stringify(data))),
        catchError(this.handleError)
      )
  }


  createPayment(pymt: Payment): Observable<Payment> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    pymt.id = 0;
    //this.pymtURL=this.envUrl.urlAddress+'/PaymentMain';
    return this.http.post<Payment>(this.envUrl.urlAddress + '/PaymentMain', pymt, { headers })
      .pipe(
        tap(data => console.log('createPayment: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }
  Serve(serv: Served): Observable<Served> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    serv.id = 0;
    return this.http.post<Served>(this.envUrl.urlAddress + '/Served', serv, { headers })
      .pipe(
        tap(data => console.log('Served: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  // getPaidPaymentsByCust(enteredBy: string): Observable<PaymentMain[]> {
  //   const url = `${this.envUrl.urlAddress}/PaymentMain/getpaidpymtsbyCust?enteredBy=${enteredBy}`;
  //   const headers = new HttpHeaders({ '': 'application/json' }); // Update the headers
  //   return this.http.get<PaymentMain[]>(url, { headers }).pipe(
  //     catchError(this.handleError)
  //   );
  // }


  deletePayment(pymt: Payment): Observable<{}> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.envUrl.urlAddress + '/paymentmain'}/deleteuser`;
    return this.http.post<Payment>(url, pymt)
      .pipe(
        tap(data => console.log('deletePayment: ' + pymt.custCode)),
        catchError(this.handleError)
      );
  }

  updatePayment(pymt: Payment): Observable<Payment> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.envUrl.urlAddress + '/paymentmain'}/updatepayment`;
    return this.http.post<Payment>(url, pymt, { headers })
      .pipe(
        tap(data => console.log('updatePayment' + pymt.custCode)),
        // Return the product on an update
        // map(() => pymt),
        catchError(this.handleError)
      );
  }


  // updateUser(registration: Registration): Observable<Registration> {
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   const url = `${this.userURL}/${registration.id}`;
  //   return this.http.put<Registration>(url, registration, { headers })
  //     .pipe(
  //       tap(() => console.log('updateUser: ' + registration.id)),
  //       // Return the product on an update
  //       map(() => registration),
  //       catchError(this.handleError)
  //     );
  // }

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


  private initializePayment(): Payment {
    return {
      id: 0,
      dateEntered: new Date(),
      enteredBy: "",
      custCode: "",
      voucherId: 0,
      unit: 0,
      amount: 0,
      paymentmodeid: 0,
      servedby: "",
      opaymentid: 0,
      paid: false,
      timepaid: new Date(),
      paymentType: 0,
      custtypeid: 0,
      VoucherDescription: '',
    };
  }

}



