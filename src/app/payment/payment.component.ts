// import { Component, OnInit } from '@angular/core';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, Observable, observable } from 'rxjs';
import { logging } from 'protractor';
import { Registration } from '../registration/registration.model';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  pageTitle = 'Payment Categories';

  constructor(private observer: BreakpointObserver, private router: Router, public authService: AuthService) { }

  ngOnInit(): void {
    this.onPaymentClick();
  }
  onPaymentClick(): void {
    const custTypeId = this.authService.registration?.custTypeId;

    if (custTypeId === 1) {
      this.router.navigate(['/staffpayment']);
    } else if (custTypeId === 2) {
      this.router.navigate(['/outsourcedpayment']);
    }
    else {
      this.router.navigate(['/guestpayment']);
    }
  }

}
