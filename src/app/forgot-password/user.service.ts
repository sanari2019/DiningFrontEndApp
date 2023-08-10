import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { Registration } from '../registration/registration.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userURL = `${this.envUrl.urlAddress}/user`;

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  getUserByUsername(username: string): Observable<Registration> {
    const url = `${this.envUrl.urlAddress}/user/getuser/${username}`;
    return this.http.get<Registration>(url)
      .pipe(
        tap(data => console.log('getUserByUsername: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  updatePassword(registration: Registration): Observable<Registration> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.envUrl.urlAddress}/${registration.id}`;
    return this.http.post<Registration>(url, registration, { headers })
      .pipe(
        tap(() => console.log('updatePassword: ' + registration.id)),
        catchError(this.handleError)
      );
  }

  private handleError(err: any): Observable<never> {
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Backend returned code ${err.status}: ${err.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
