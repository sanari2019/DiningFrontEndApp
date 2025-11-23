import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnlinePayment } from './onlinepayment.model';
import { Payment } from '../staffpayment/payment.model'
import { OrderedMeal } from '../guestpayment/orderedmeal.model'
import { environment } from 'src/environments/environment';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { TotalRevenueModel } from '../pages/Administration/totalRevenue.model';
import { catchError, tap } from 'rxjs/operators';

export interface OnlinePaymentService {
  id: number;
  TransRefNo: number;
  TransDate: Date;
  Paidby: number;
  AmountPaid: number;
  PymtTypeid: number;
}

@Injectable({
  providedIn: 'root'
})
export class OnlinePaymentService {
  private apiUrl = `${this.envUrl.urlAddress}/OnlinePayment`;
  private webhookApiUrl = `${this.envUrl.urlAddress}/api/webhook`;

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  fetchPaymentContent(paymentUrl: string): Observable<any> {
    return this.http.post(paymentUrl, { responseType: 'text' });
  }

  // Post an online payment
  postOnlinePayment(pymt: Payment, payment: OnlinePayment, orderedMeals: OrderedMeal[], pymnt: Payment[]): Observable<any> {
    const requestData = { pymt, payment, orderedMeals, pymnt };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(this.apiUrl, requestData, { headers });
  }

  /**
   * Verify Paystack transaction via backend (secure - no secret key exposed)
   */
  verifyPaystackTransaction(reference: string): Observable<any> {
    return this.http.get<any>(`${this.webhookApiUrl}/verify/${reference}`);
  }

  /**
   * @deprecated Use verifyPaystackTransaction instead - this calls backend for secure verification
   */
  verifypaystackTransaction(reference: string): Observable<any> {
    // Redirect to backend verification endpoint (secure)
    return this.verifyPaystackTransaction(reference);
  }

  /**
   * Verify Squad transaction via backend
   * TODO: Add backend endpoint for Squad verification
   */
  verifysquadTransaction(transactionRef: string): Observable<any> {
    // For now, still direct call - should be moved to backend
    const url = `https://api-d.squadco.com/transaction/verify/${transactionRef}`;
    // Note: This will fail due to CORS - needs backend proxy
    return this.http.get<any>(url);
  }

  verifysquadfTransaction(transactionRef: string): Observable<any> {
    return this.verifysquadTransaction(transactionRef);
  }

  checkRef(reference: string): Observable<any> {
    const url = `${this.apiUrl}/GetOnlinePaymentByRefNo/${reference}`;
    return this.http.get(url);
  }

  getTotalRevenue(startDate: Date, endDate: Date): Observable<TotalRevenueModel[]> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    return this.http.get<TotalRevenueModel[]>(`${this.apiUrl}/TotalRevenue`, { params });
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return new Observable<never>();
  }
}
