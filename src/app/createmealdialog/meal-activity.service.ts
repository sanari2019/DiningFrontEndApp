import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { MealActivity } from './meal-activity.model';

@Injectable({
    providedIn: 'root'
})
export class MealActivityService {

    private MealActivityURL = ''; // Set your API endpoint URL here

    constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) {
        this.MealActivityURL = this.envUrl.urlAddress + '/MealActivity';
    }


    createMealActivity(MealActivity: MealActivity): Observable<MealActivity> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        MealActivity.id = 0; // Assuming it's a new entry
        return this.http.post<MealActivity>(this.MealActivityURL, MealActivity, { headers });
    }

    updateMealActivity(MealActivity: MealActivity): Observable<MealActivity> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${this.MealActivityURL}/update`;
        return this.http.post<MealActivity>(url, MealActivity, { headers });
    }


    // Add more methods as needed

    //   private handleError(err: any): Observable<never> {
    //     // Handle errors here (similar to the handleError method in PaymentService)
    //   }
}
