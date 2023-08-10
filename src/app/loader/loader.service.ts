import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private activeRequests = 0;

  show() {
    if (this.activeRequests === 0) {
      this.isLoadingSubject.next(true);
    }
    this.activeRequests++;
  }

  hide() {
    this.activeRequests--;
    if (this.activeRequests === 0) {
      this.isLoadingSubject.next(false);
    }
  }
}
