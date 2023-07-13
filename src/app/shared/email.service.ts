import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmailModel } from './email.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly baseUrl = 'https://localhost:7146/send-email'; // Replace with your API base URL

  constructor(private http: HttpClient) {}

  sendEmail(message: EmailModel): Promise<void> {
    const url = `${this.baseUrl}/email/send`;

    return this.http.post<void>(url, message).toPromise();
  }
}