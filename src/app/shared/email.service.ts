import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmailModel } from './email.model';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly baseUrl = `${this.envUrl.urlAddress}/send-email`; // Replace with your API base URL

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  sendEmail(message: EmailModel): Promise<void> {
    const url = `${this.baseUrl}/email/send`;

    return this.http.post<void>(url, message).toPromise();
  }
}