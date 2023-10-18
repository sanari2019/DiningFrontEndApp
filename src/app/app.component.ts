import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from './auth/auth.service';
import { BehaviorSubject, Observable, observable } from 'rxjs';
import { logging } from 'protractor';
import { Registration } from './registration/registration.model';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Route } from './shared/route.model';
import { RegistrationService } from './registration/registration.service';
import { map } from 'rxjs/operators';
import { LoaderService } from './loader/loader.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoading$: Observable<boolean>;
  @ViewChild('drawer') drawer: any;
  title = 'angular-responsive-sidebar';
  isLoggedIn$!: Observable<boolean>;
  loggeInUser: Registration | undefined; // Holds the logged-in user
  loggedinUser = ' ';
  registration: Registration | undefined;
  routes!: Route[];

  user: Registration = {
    id: 0,
    custTypeId: 0,
    custId: '',
    firstName: '',
    lastName: '',
    userName: '',
    password: '',
    freeze: false
  }; // Initialize an empty user object
  freezeStatus: boolean = false;

  currentRoute: Route | undefined;
  private loggedIn = new BehaviorSubject<boolean>(false);

  public isHandset$: Observable<boolean> = this.observer
    .observe(Breakpoints.Handset)
    .pipe(map((result: BreakpointState) => result.matches));



  constructor(private loaderService: LoaderService, private observer: BreakpointObserver, private router: Router, public authService: AuthService, private regservice: RegistrationService) {
    this.isLoading$ = this.loaderService.isLoading$;
  }

  // onPaymentClick(): void {
  //   const custTypeId = this.authService.registration?.custTypeId;

  //   if (custTypeId === 1) {
  //     this.router.navigate(['/staffpayment']);
  //   } else if (custTypeId === 2) {
  //     this.router.navigate(['/outsourcedpayment']);
  //   }
  //   else {
  //     this.router.navigate(['/guestpayment']);
  //   }
  // }
  navigateurl(rte: Route): void {

    this.router.navigate(['/' + rte.path]);
    localStorage.setItem('page', JSON.stringify(rte));


  }
  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }
  getUser(userId: number): void {
    this.regservice.getUser(userId).subscribe((user: Registration) => {
      if (user && user.freeze) {
        this.user = user;
        this.freezeStatus = user.freeze;
      }

    },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );
  }
  navigateAndRefresh(): void {
    // Define the target route you want to navigate to
    const targetRoute = '/payment'; // Replace with your desired route

    // Navigate to the target route
    this.router.navigateByUrl(targetRoute).then(() => {
      // After navigation is complete, refresh the current page
      window.location.reload();
    });
  }

  toggleFreezeStatus(): void {
    const userObject = JSON.parse(localStorage.getItem('user') || '{}');
    this.user = userObject
    if (this.user.freeze === true) {
      this.user.freeze = false;
    } else {
      this.user.freeze = true;
    }

    this.regservice.updateUser(this.user).subscribe(
      (updatedUser: Registration) => {
        //console.log('Freeze status updated successfully:', updatedUser);
        const currentRoute = this.router.url;
        // this.freezeStatus = this.user.freeze;
        localStorage.setItem('user', JSON.stringify(userObject));

        // Check if the current route is '/payment'
        if (currentRoute === '/home') {
          // If on '/payment', navigate to '/home'
          this.router.navigate(['/payment'], { replaceUrl: true });
          // this.currentRoute = '/payment';

        } else {
          // Otherwise, navigate to '/payment'
          this.router.navigate(['/home'], { replaceUrl: true });

        }

      },
      (error) => {
        console.error('Error updating freeze status:', error);
      }
    );


  }







  ngOnInit() {



    this.isLoggedIn$ = this.authService.isLoggedIn;
    if (this.isLoggedIn$ == undefined) {
      this.router.navigate(['/login']);
    }
    this.isLoggedIn$.subscribe((rslt: any) => {
      if (this.isLoggedIn$ !== undefined) {
        this.registration = this.authService.registration;//JSON.parse(localStorage.getItem('user')|| '[]');
        if (this.registration) {
          this.regservice.getRoles(this.registration).subscribe(
            (roless: Route[]) => {
              this.routes = roless;
              // this.filteredPaymentDetails = this.paymentDetails;
            });
        }
        if (this.registration != undefined && this.registration.firstName != undefined) {
          this.loggedinUser = 'Welcome: ' + this.registration?.firstName + ' ' + this.registration?.lastName;
        }
        else {
          this.loggedinUser = '';
        }
        this.currentRoute = JSON.parse(localStorage.getItem('page') || '[]');
        if (this.currentRoute?.path !== undefined) {
          this.registration = JSON.parse(localStorage.getItem('user') || '[]');
          this.loggedIn.next(true);
        }
        else {
          // Check if the 'user' key is present in localStorage, if not, redirect to login
          if (!localStorage.getItem('user')) {
            this.router.navigate(['/login']);
          }
        }
        if (this.currentRoute?.path !== undefined && this.registration?.firstName != undefined) {
          this.router.navigate(['/' + this.currentRoute?.path]);
          this.isLoggedIn$ = this.isLoggedIn;
          this.isLoggedIn$.subscribe((rslt: any) => {
            if (this.isLoggedIn$ !== undefined) {
              this.registration = JSON.parse(localStorage.getItem('user') || '[]');
              if (this.registration) {
                this.regservice.getRoles(this.registration).subscribe(
                  (roless: Route[]) => {
                    this.routes = roless;
                    // this.routes.sort((a, b) => a.menuName.localeCompare(b.menuName));
                    // this.filteredPaymentDetails = this.paymentDetails;

                  });

              }
              else {
                if (!localStorage.getItem('user')) {
                  this.router.navigate(['/login']);
                }
              }
            } else {
              if (!localStorage.getItem('user')) {
                this.router.navigate(['/login']);
              }
            }
          });
        } else {
          if (!localStorage.getItem('user')) {
            this.router.navigate(['/login']);
          }
        }
      }

    });
    // this.toggleFreezeStatus()

    // Parse user object from JSON string
    const userObject = JSON.parse(localStorage.getItem('user') || '{}');
    if (userObject.id) {
      const userId = userObject.id;

      // Now you have the userId, you can use it wherever you need
      // For example, you can call the `getUser` method with the userId
      this.getUser(userId);

    }
  }
  onLogout() {
    this.authService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('page');
    localStorage.removeItem('selectedPaymentItems');
    localStorage.clear();
    this.loggedinUser = '';
    this.isLoggedIn$ = this.authService.isLoggedIn;

  }
  setLandingPage(route: Route) {
    // Set the landing page route using Angular Router
    this.router.navigate(['/' + route.path]);
  }

  ngAfterViewInit() {

    this.router.events
      .pipe(
        untilDestroyed(this),
        filter((e) => e instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this.drawer?.mode === 'over') {
          this.drawer?.close();
        }
      });
  }
}



