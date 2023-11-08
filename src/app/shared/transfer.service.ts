import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Transfer } from './transfer.model';
import { TransferTransaction } from './transferTransaction.model';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';

@Injectable({
    providedIn: 'root'
})
export class TransferService {
    private baseURL = `${this.envUrl.urlAddress}/transfer`;

    constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

    getTransfers(): Observable<Transfer[]> {
        return this.http.get<Transfer[]>(this.baseURL).pipe(
            catchError(this.handleError)
        );
    }

    getTransfer(id: number): Observable<Transfer> {
        if (id === 0) {
            return new Observable<Transfer>();
        }
        const url = `${this.baseURL}/${id}`;
        return this.http.get<Transfer>(url).pipe(
            catchError(this.handleError)
        );
    }

    insertTransfer(transfer: Transfer): Observable<Transfer> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        transfer.id = 0;
        return this.http.post<Transfer>(this.baseURL, transfer, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    updateTransfer(transfer: Transfer): Observable<Transfer> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${this.baseURL}/${transfer.id}`;
        return this.http.put<Transfer>(url, transfer, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    deleteTransfer(transfer: Transfer): Observable<number> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${this.baseURL}/delete`;
        return this.http.post<number>(url, transfer, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    completePayment(transferTransaction: TransferTransaction): Observable<TransferTransaction> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const url = `${this.baseURL}/completeTransaction2`;
        return this.http.post<TransferTransaction>(url, transferTransaction, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: any): Observable<never> {
        console.error('An error occurred:', error);
        return new Observable<never>();
    }
}
