import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private emailApiUrl = 'https://localhost:7146/send-email'; // Replace with your email sending API endpoint

  constructor(private http: HttpClient) {}

  sendEmail(emailData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.emailApiUrl, emailData, { headers });
  }
}
