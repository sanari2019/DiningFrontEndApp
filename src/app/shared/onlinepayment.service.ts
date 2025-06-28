import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnlinePayment } from './onlinepayment.model';
import { Payment } from '../staffpayment/payment.model'
import { OrderedMeal } from '../guestpayment/orderedmeal.model'
import { environment } from 'src/environments/environment';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';
import { TotalRevenueModel } from '../pages/Administration/totalRevenue.model';
import { catchError, retry, tap } from 'rxjs/operators';
import axios, { AxiosRequestConfig } from 'axios';
import client from './client';



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
  //   private apiUrl = 'https://localhost:7146/OnlinePayment'; 
  private apiUrl = `${this.envUrl.urlAddress}/OnlinePayment`;
  private baseUrl = 'https://api-d.squadco.com/transaction/initiate';
  private secretKey = 'sk_10018e38023e48ac395dbb49786bf22f8c9969f1'; // Replace with your actual authorization key
  private secretKey2 = 'sk_live_60bcaef604255e41e2ac842412dc399cbb39880a';

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  fetchPaymentContent(paymentUrl: string): Observable<any> {
    return this.http.post(paymentUrl, { responseType: 'text' });
  }

  // Post an online payment
  postOnlinePayment(pymt: Payment, payment: OnlinePayment, orderedMeals: OrderedMeal[], pymnt: Payment[]): Observable<any> {
    const requestData = { pymt, payment, orderedMeals, pymnt };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Example header, adjust as needed
      // Add more headers if required by your server
    });
    return this.http.post(this.apiUrl, requestData, { headers });
  }
  // verifyTransaction(reference: string): Observable<any> {
  //   // const url = `https://api.paystack.co/transaction/verify/${reference}`;
  //   const secretKey = 'sandbox_sk_38cc94de58bd7495f48750e3b942a67e83d326a688b2'; // Replace with your actual secret key

  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${secretKey}`
  //   });

  //   return this.http.get(url, { headers }).pipe(
  //     tap(data => console.log('Transaction verification successful: ', data)),
  //     catchError(this.handleError)
  //   );
  // }

  verifysquadTransaction(transactionRef: string): Observable<any> {
    const url = `https://api-d.squadco.com/transaction/verify/${transactionRef}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.secretKey}`
    });

    return this.http.get<any>(url, { headers });
  }
  verifysquadfTransaction(transactionRef: string): Observable<any> {
    const url = `https://api-d.squadco.com/transaction/verify/${transactionRef}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.secretKey}`
    });

    return this.http.get<any>(url, { headers });
  }
  verifypaystackTransaction(reference: string): Observable<any> {
    const url = `https://api.paystack.co/transaction/verify/${reference}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.secretKey2}`
    });

    return this.http.get<any>(url, { headers });
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

  // initiatePayment(payload: any) {
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${this.secretKey}`
  //   });


  //   return this.http.post<any>(this.baseUrl, payload, { headers });
  // }
  // async initiatePayment(payload: any): Promise<any> {

  //   const referrerUrl =
  //     window.location !== window.parent.location ? document.referrer : document.location.href;
  //   // const body = {
  //   //   amount: payload?.amount,
  //   //   email: payload?.email,
  //   //   currency: payload?.currency,
  //   //   transaction_ref: payload?.transaction_ref,
  //   // };
  //   const body = {
  //     amount: payload?.amount,
  //     email: payload?.email,
  //     currency: payload?.currency_code,
  //     products: payload?.products,
  //     transaction_ref: payload?.order_id ?? payload?.transaction_ref,
  //     payment_channels: payload?.payment_channels,
  //     recurring: payload?.recurring,
  //     is_recurring: payload?.is_recurring,
  //     pass_charge: payload?.pass_charge,
  //     initiate_type: payload?.initiate_type,
  //     metadata: {
  //       user_agent: window.navigator.userAgent,
  //       customer_name: payload?.customer_name,
  //       payment_link_id: payload?.payment_link_id,
  //       payment_link_type: payload?.payment_link_type,
  //       order_id: payload?.order_id,
  //       // source: deviceType === "browser" ? "Desktop" : "Mobile",
  //       referrer_url: referrerUrl,
  //       referring_site: referrerUrl,
  //       // fingerprintData: JSON.stringify(fingerprintData),
  //       callback_url: payload?.metadata?.callback_url,
  //       initiate_type: payload?.metadata?.initiate_type,
  //       ...payload?.metadata,
  //       ...payload?.config_meta
  //     }
  //   };

  //   const headers: AxiosRequestConfig['headers'] = {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${this.secretKey}`
  //   };

  //   const params = {
  //     method: body ? "POST" : "GET",
  //     headers: {
  //       ...headers
  //     }
  //   };

  //   if (body) params.data = JSON.stringify(body);

  //   const { data } = await axios(endpoint, params);
  //   return data;

  //   return body?.amount && body?.email && body?.currency && client("/payment/Initiate", { body });
  // }

  // async initiatePayment(payload: any): Promise<any> {
  //   const referrerUrl =
  //     window.location !== window.parent.location ? document.referrer : document.location.href;

  //   const body = {
  //     amount: payload?.amount,
  //     email: payload?.email,
  //     currency: payload?.currency,
  //     // products: payload?.products,
  //     transaction_ref: payload?.transaction_ref,
  //     // checkout_url: `https://pay.squadco.com/${payload?.transaction_ref}`
  //     // payment_channels: payload?.payment_channels,
  //     // recurring: payload?.recurring,
  //     // // is_recurring: payload?.is_recurring,
  //     // pass_charge: payload?.pass_charge,
  //     // initiate_type: payload?.initiate_type,
  //     // metadata: {
  //     //   user_agent: window.navigator.userAgent,
  //     //   customer_name: payload?.customer_name,
  //     //   payment_link_id: payload?.payment_link_id,
  //     //   payment_link_type: payload?.payment_link_type,
  //     //   order_id: payload?.order_id,
  //     //   // source: deviceType === "browser" ? "Desktop" : "Mobile",
  //     //   referrer_url: referrerUrl,
  //     //   referring_site: referrerUrl,
  //     //   // fingerprintData: JSON.stringify(fingerprintData),
  //     //   callback_url: payload?.metadata?.callback_url,
  //     //   initiate_type: payload?.metadata?.initiate_type,
  //     //   ...payload?.metadata,
  //     //   ...payload?.config_meta
  //     // }
  //   };

  //   const headers: AxiosRequestConfig['headers'] = {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${this.secretKey}`
  //     // Add other headers if needed
  //   };

  //   try {
  //     const response = await axios.post(this.baseUrl, body, { headers });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error initiating payment:', error);
  //     throw error;
  //   }
  // }


  // initiatePayment(payload: any) {
  //   const headers = {
  //     Authorization: this.authorizationKey,
  //     'Content-Type': 'application/json',
  //   };

  //   return this.http.post<any>(this.baseUrl, payload, { headers });
  // }

}

