import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from './feedback.model';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private feedbackUrl = `${this.envUrl.urlAddress}/feedback`;

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  // Create a method to post feedback to the server
  postFeedback(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(this.feedbackUrl, feedback);
  }

  // Add other methods for retrieving, updating, and deleting feedback if needed
}
