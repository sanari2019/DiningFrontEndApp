import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Served } from './served.model';
import { environment } from '../../environments/environment';
import { Registration } from '../registration/registration.model';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { ServedEmail } from './servedEmail.model';
import { HistoryRecords } from '../pages/home/historyrecords.model';
import { ServedReportModel } from '../pages/Administration/servedReport.model';
import { UnservedReportModel } from '../pages/Administration/unservedReport.model';
import { ServedSummaryReportModel } from '../pages/Administration/servedSummaryReport.model';

@Injectable({
  providedIn: 'root'
})
export class ServedService {
  private apiUrl = `${environment.urlAddress}/served`;

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  getServed(): Observable<Served[]> {
    return this.http.get<Served[]>(this.apiUrl);
  }

  getDailyServedCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/ServedMealsCount`);
  }

  getServedById(id: number): Observable<Served> {
    return this.http.get<Served>(`${this.apiUrl}/${id}`);
  }
  getHistoryRecords(ServedBy: number): Observable<HistoryRecords[]> {
    return this.http.get<HistoryRecords[]>(`${this.apiUrl}/getHistoryRecords/${ServedBy}`);
  }
  getServedByCustomer(user: Registration): Observable<Served[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Served[]>(`${this.apiUrl}/getServedbyCustomer`, user, { headers });
  }

  sendServedEmail(served: ServedEmail): Observable<ServedEmail> {
    return this.http.post<ServedEmail>(`${this.apiUrl}/getServedemail`, served);
  }





  updateServed(served: Served): Observable<Served> {
    return this.http.post<Served>(`${this.apiUrl}/updateServed`, served);
  }

  addServed(served: Served): Observable<Served> {
    return this.http.post<Served>(this.apiUrl, served);
  }

  deleteServed(served: Served): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteserved`, served);
  }
  getServedReport(startDate: Date, endDate: Date): Observable<ServedReportModel[]> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    return this.http.get<ServedReportModel[]>(`${this.apiUrl}/servedreport`, { params });
  }
  getUnservedReport(startDate: Date, endDate: Date): Observable<UnservedReportModel[]> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    return this.http.get<UnservedReportModel[]>(`${this.apiUrl}/unservedreport`, { params });
  }
  getServedSummaryReport(startDate: Date, endDate: Date): Observable<ServedSummaryReportModel[]> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    return this.http.get<ServedSummaryReportModel[]>(`${this.apiUrl}/servedsummaryreport`, { params });
  }



}
