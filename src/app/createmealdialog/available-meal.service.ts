import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { AvailableMeal } from './availableMeal.model';

@Injectable({
    providedIn: 'root'
})
export class AvailableMealService {

    private availableMealURL = ''; // Set your API endpoint URL here

    constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) {
        this.availableMealURL = this.envUrl.urlAddress + '/availablemeal';
    }

    getAllAvailableMeals(): Observable<AvailableMeal[]> {
        return this.http.get<AvailableMeal[]>(this.availableMealURL);
    }
    getActiveMeals(): Observable<AvailableMeal[]> {
        const activeMealsUrl = `${this.availableMealURL}/ActiveMeals`;
        return this.http.get<AvailableMeal[]>(activeMealsUrl);
    }
    getInactiveMeals(): Observable<AvailableMeal[]> {
        const inactiveMealsUrl = `${this.availableMealURL}/InactiveMeals`;
        return this.http.get<AvailableMeal[]>(inactiveMealsUrl);
    }

    createAvailableMeal(availableMeal: AvailableMeal): Observable<AvailableMeal> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        availableMeal.id = 0; // Assuming it's a new entry
        return this.http.post<AvailableMeal>(this.availableMealURL, availableMeal, { headers });
    }

    updateAvailableMeal(availableMeal: AvailableMeal): Observable<AvailableMeal> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${this.availableMealURL}/update`;
        return this.http.post<AvailableMeal>(url, availableMeal, { headers });
    }

    deleteAvailableMeal(availableMeal: AvailableMeal): Observable<{}> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${this.availableMealURL}/deleteavailablemeal`;
        return this.http.post<AvailableMeal>(url, availableMeal);
    }

    // Add more methods as needed

    //   private handleError(err: any): Observable<never> {
    //     // Handle errors here (similar to the handleError method in PaymentService)
    //   }
}
