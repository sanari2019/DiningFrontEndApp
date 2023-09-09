import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from "@angular/common/http";
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { MealTariff } from './mealtariff.model';
import { Menu } from './menu.model';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { MenuandTariff } from './menuandtariff.model';

@Injectable({
    providedIn: 'root'
})

export class MealTariffService {

    private baseURL = `${this.envUrl.urlAddress}/mealtariff`;



    constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

    getMealTariffs(): Observable<MealTariff[]> {
        return this.http.get<MealTariff[]>(this.baseURL)
        // .pipe(
        //   tap(data => this.getUserdata(data)),
        //   catchError(this.handleError)
        // );
    }
    getMealTariffsByMenuid(menuid: number): Observable<MealTariff[]> {
        const url = `${this.baseURL}/getordmealsbycust`;
        return this.http.post<MealTariff[]>(url, { menuid: menuid })
            .pipe(
                tap(data => console.log('getMealTariffsByCust: ' + JSON.stringify(data))),
                catchError(this.handleError)
            );
    }
    getMenuandTariff(): Observable<MenuandTariff[]> {
        const url = `${this.baseURL}/maxtariff`;
        return this.http.get<MenuandTariff[]>(url)
    }
    getMenutarrifByMaximumID(menuid: number): Observable<MealTariff[]> {
        const url = `${this.baseURL}/maximum/${menuid}`;
        return this.http.post<MealTariff[]>(url, { menuid: menuid })
            .pipe(
                tap(data => console.log('getFirstMenuTarriff: ' + JSON.stringify(data))),
                catchError(this.handleError)
            );
    }
    getMenutarriffByMaximumID(menuid: number): Observable<MealTariff> {
        const url = `${this.baseURL}/maximumof/${menuid}`;
        return this.http.get<MealTariff>(url)
            .pipe(
                tap(data => console.log('getMenutarriffByMaximumID: ' + JSON.stringify(data))),
                catchError(this.handleError)
            );
    }



    getMealTariffdata(data: MealTariff) {
        console.log(JSON.stringify(data))
    }

    getMealTariff(id: number): Observable<MealTariff> {
        if (id === 0) {
            return of(this.initializeMealTariff());
        }
        const url = `${this.baseURL}/${id}`;
        return this.http.get<MealTariff>(url)
            .pipe(
                tap(data => console.log('getOrder: ' + JSON.stringify(data))),
                catchError(this.handleError)
            )
    }
    // getMealTariffsByPaymentMainId(payment: Payment): Observable<MealTariff[]> {
    //     const url = `${this.baseURL}/getordmealsbypymtid`;
    //     return this.http.post<MealTariff[]>(url, payment)
    //         .pipe(
    //             tap(data => console.log('getMealTariffsByPaymentMainId: ' + JSON.stringify(data))),
    //             catchError(this.handleError)
    //         );
    // }


    // getUserbyusername(username: string): Observable<MealTariff> {

    //   const url = `${this.baseURL}/getuser/${username}`;
    //   return this.http.get<MealTariff>(url)
    //     .pipe(
    //       tap(data => console.log('getUser: ' + JSON.stringify(data))),
    //       catchError(this.handleError)
    //     )
    // }

    createMealTariff(ordMeal: MealTariff): Observable<MealTariff> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        ordMeal.id = 0;
        return this.http.post<MealTariff>(this.baseURL, ordMeal, { headers })
            .pipe(
                tap(data => console.log('createMealTariff: ' + JSON.stringify(data))),
                catchError(this.handleError)
            );
    }


    deleteOrder(ordMeal: MealTariff): Observable<{}> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${this.baseURL}/deleteMealTariff`;
        return this.http.post<MealTariff>(url, ordMeal)
            .pipe(
                tap(data => console.log('deleteOrder: ' + ordMeal.id)),
                catchError(this.handleError)
            );
    }

    updateOrder(ordMeal: MealTariff): Observable<MealTariff> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${this.baseURL}/${ordMeal.id}`;
        return this.http.post<MealTariff>(url, ordMeal, { headers })
            .pipe(
                tap(() => console.log('updateTariff: ' + ordMeal.id)),
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


    private initializeMealTariff(): MealTariff {
        return {
            id: 0,
            menuid: 0,
            menu: new Menu(),
            tariff: 0,
            datechanged: new Date,
            active: false,
        };
    }

}



