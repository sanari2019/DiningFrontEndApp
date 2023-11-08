import { Injectable } from '@angular/core';
import { OrderedMeal } from './orderedmeal.model';
import { HttpClient, HttpClientModule, HttpHeaders } from "@angular/common/http";
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Menu } from './menu.model';
import { Payment } from '../staffpayment/payment.model';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { ServedAlacarteVoucherModel } from '../pages/Administration/servedAlacartVoucherModel.model';

@Injectable({
  providedIn: 'root'
})

export class OrderedMealService {

  private orderedmealURL = `${this.envUrl.urlAddress}/orderedmeal`;
  private ordMeal = OrderedMeal;

  //private handleError="";

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  getOrderedMeals(): Observable<OrderedMeal[]> {
    return this.http.get<OrderedMeal[]>(this.orderedmealURL)
    // .pipe(
    //   tap(data => this.getUserdata(data)),
    //   catchError(this.handleError)
    // );
  }
  getOrderedMealsByCust(userId: number): Observable<OrderedMeal[]> {
    const url = `${this.orderedmealURL}/getordmealsbycust`;
    return this.http.post<OrderedMeal[]>(url, { id: userId })
      .pipe(
        tap(data => console.log('getOrderedMealsByCust: ')),
        catchError(this.handleError)
      );
  }


  getOrderedMealdata(data: OrderedMeal[]) {
    console.log(JSON.stringify(data))
  }

  getOrderedMeal(id: number): Observable<OrderedMeal> {
    if (id === 0) {
      return of(this.initializeOrderedMeal());
    }
    const url = `${this.orderedmealURL}/${id}`;
    return this.http.get<OrderedMeal>(url)
      .pipe(
        tap(data => console.log('getOrder: ' + JSON.stringify(data))),
        catchError(this.handleError)
      )
  }
  getOrderedMealsByPaymentMainId(payment: Payment): Observable<OrderedMeal[]> {
    const url = `${this.orderedmealURL}/getordmealsbypymtid`;
    return this.http.post<OrderedMeal[]>(url, payment)
      .pipe(
        tap(data => console.log('getOrderedMealsByPaymentMainId: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }


  // getUserbyusername(username: string): Observable<OrderedMeal> {

  //   const url = `${this.orderedmealURL}/getuser/${username}`;
  //   return this.http.get<OrderedMeal>(url)
  //     .pipe(
  //       tap(data => console.log('getUser: ' + JSON.stringify(data))),
  //       catchError(this.handleError)
  //     )
  // }
  getAlacarteOrders(startDate: Date, endDate: Date): Observable<ServedAlacarteVoucherModel[]> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    return this.http.get<ServedAlacarteVoucherModel[]>(`${this.orderedmealURL}/AlacarteOrders`, { params });
  }

  createOrder(ordMeal: OrderedMeal): Observable<OrderedMeal> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    ordMeal.id = 0;
    return this.http.post<OrderedMeal>(this.orderedmealURL, ordMeal, { headers })
      .pipe(
        tap(data => console.log('createOrder: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }


  deleteOrder(ordMeal: OrderedMeal): Observable<{}> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.orderedmealURL}/deleteorderedmeal`;
    return this.http.post<OrderedMeal>(url, ordMeal)
      .pipe(
        tap(data => console.log('deleteOrder: ' + ordMeal.id)),
        catchError(this.handleError)
      );
  }

  updateOrder(ordMeal: OrderedMeal): Observable<OrderedMeal> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.orderedmealURL}/${ordMeal.id}`;
    return this.http.post<OrderedMeal>(url, ordMeal, { headers })
      .pipe(
        tap(() => console.log('updateUser: ' + ordMeal.id)),
        // Return the product on an update
        map(() => ordMeal),
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


  private initializeOrderedMeal(): OrderedMeal {
    return {
      id: 0,
      guest: '',
      mealid: 0,
      enteredBy: '',
      amount: 0,
      dateEntered: new Date,
      // paymentTypeId: 0,
      menu: new Menu(),
      Submitted: false,
      paymentMainId: 0,
    };
  }

}



