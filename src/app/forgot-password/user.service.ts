import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userURL = 'https://localhost:7146/user';
  private envUrl: string;

  constructor(private http: HttpClient, private envUrlService: EnvironmentUrlService) {
    this.envUrl = envUrlService.urlAddress;
  }

  checkEmail(email: string): Observable<boolean> {
    const url = `${this.envUrl}/user/checkemail/${email}`;
    return this.http.get<boolean>(url).pipe(
      catchError(this.handleError)
    );
  }

  updatePassword(email: string, newPassword: string): Observable<boolean> {
    const url = `${this.envUrl}/user/resetpassword`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const user = { email, newPassword };
    return this.http.post<boolean>(url, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(err: any): Observable<never> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Backend returned code ${err.status}: ${err.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
