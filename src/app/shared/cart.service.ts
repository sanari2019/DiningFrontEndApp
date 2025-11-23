// cart.service.ts

import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';

export interface CartItem {
  id: number;
  name: string;
  unit: number;
  amount: number;
  paymentMode: string;
  voucherId?: number;
  paymentData?: any;
  custCode?: string;
  custtypeid?: number;
  enteredBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = `${this.envUrl.urlAddress}//PaymentDetails`;
  private cartItems: CartItem[] = [];
  public cartUpdated: EventEmitter<CartItem[]> = new EventEmitter<CartItem[]>();
  public openCartRequested: EventEmitter<void> = new EventEmitter<void>();

  fetchUserPaymentDetails(userId: string): Observable<any> {
    const url = `${this.baseUrl}/${userId}`;
    return this.http.get(url);
  }

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) {
    this.loadFromStorage();
  }

  getUserPaymentDetails(userId: string): Observable<any> {
    const url = `${this.baseUrl}/${userId}`;
    return this.http.get(url);
  }

  addToCart(item: CartItem): void {
    const existing = item.voucherId
      ? this.cartItems.find(i => i.voucherId === item.voucherId)
      : undefined;

    if (existing) {
      existing.unit += item.unit;
      if (item.paymentData) {
        existing.paymentData = item.paymentData;
      }
    } else {
      this.cartItems.push(item);
    }
    this.persist();
    this.cartUpdated.emit(this.cartItems);
  }

  removeItem(item: CartItem): void {
    const index = this.cartItems.indexOf(item);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
      this.persist();
      this.cartUpdated.emit(this.cartItems);
    }
  }

  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  clearCart(): void {
    this.cartItems = [];
    this.persist();
    this.cartUpdated.emit(this.cartItems);
  }

  updateCartItem(updated: CartItem): void {
    const idx = this.cartItems.findIndex(i => i.id === updated.id || (i.voucherId && i.voucherId === updated.voucherId));
    if (idx !== -1) {
      this.cartItems[idx] = { ...this.cartItems[idx], ...updated };
      this.persist();
      this.cartUpdated.emit(this.cartItems);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    } catch {}
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('cartItems');
      if (stored) {
        this.cartItems = JSON.parse(stored);
      }
    } catch {
      this.cartItems = [];
    }
  }
}
