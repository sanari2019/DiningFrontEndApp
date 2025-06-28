import { AfterViewInit, Component, OnInit, ViewChild, HostListener } from '@angular/core';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { catchError, delay, filter, finalize } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from './auth/auth.service';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { Registration } from './registration/registration.model';
import { Route } from './shared/route.model';
import { RegistrationService } from './registration/registration.service';
import { map } from 'rxjs/operators';
import { LoaderService } from './loader/loader.service';
import { MatAccordion } from '@angular/material/expansion';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  // Observable properties
  isLoading$: Observable<boolean>;
  isLoggedIn$!: Observable<boolean>;
  isHandset$: Observable<boolean>;

  // ViewChild references
  @ViewChild('drawer') drawer: any;
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  // Component properties
  title = 'angular-responsive-sidebar';
  loggedinUser = '';
  registration: Registration | undefined;
  routes: Route[] = [];
  hidden = false;
  freezeStatus = false;
  currentRoute: Route | undefined;

  // User object with default values
  user: Registration = {
    id: 0,
    custTypeId: 0,
    custId: '',
    firstName: '',
    lastName: '',
    userName: '',
    password: '',
    freeze: false,
    autolock: false
  };

  // Private properties
  private loggedIn = new BehaviorSubject<boolean>(false);
  private isInitialized = false;

  constructor(
    private loaderService: LoaderService,
    private observer: BreakpointObserver,
    private router: Router,
    public authService: AuthService,
    private regservice: RegistrationService
  ) {
    this.isLoading$ = this.loaderService.isLoading$;
    this.isHandset$ = this.observer
      .observe(Breakpoints.Handset)
      .pipe(map((result: BreakpointState) => result.matches));
  }

  @HostListener('window:mousemove')
  @HostListener('window:keypress')
  onUserActivity(): void {
    // Uncomment when auto-logout is implemented
    // this.authService.resetLogoutTimer();
  }

  ngOnInit(): void {
    this.initializeApp();
  }

  /**
   * Main initialization method
   */
  private initializeApp(): void {
    // Check if user authentication exists
    this.isLoggedIn$ = this.authService.isLoggedIn;
    
    if (!this.isLoggedIn$) {
      this.redirectToLogin();
      return;
    }

    // Subscribe to authentication state changes
    this.isLoggedIn$
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (isAuthenticated: boolean) => {
          if (isAuthenticated) {
            this.handleAuthenticatedUser();
          } else {
            this.redirectToLogin();
          }
        },
        error: (error) => {
          console.error('Authentication error:', error);
          this.redirectToLogin();
        }
      });
  }

  /**
   * Handle authenticated user initialization
   */
  private handleAuthenticatedUser(): void {
    try {
      // Get registration data from AuthService
      this.registration = this.authService.registration;
      
      if (!this.registration) {
        console.warn('No registration data found in AuthService');
        this.redirectToLogin();
        return;
      }

      // Set welcome message
      this.setWelcomeMessage();

      // Load user data and routes in parallel
      this.loadUserDataAndRoutes();

      // Handle page restoration
      this.handlePageRestoration();

    } catch (error) {
      console.error('Error handling authenticated user:', error);
      this.redirectToLogin();
    }
  }

  /**
   * Load user data and routes in parallel
   */
  private loadUserDataAndRoutes(): void {
    if (!this.registration) return;

    // Get roles/routes
    this.regservice.getRoles(this.registration)
      .pipe(
        catchError(error => {
          console.error('Error loading user roles:', error);
          return of([]); // Return empty array on error
        }),
        untilDestroyed(this)
      )
      .subscribe((routes: Route[]) => {
        this.routes = routes;
      });

    // Load user details from localStorage and backend
    this.loadUserDetails();
  }

  /**
   * Load user details and freeze status
   */
  private loadUserDetails(): void {
    const userObject = this.getUserFromLocalStorage();
    
    if (userObject?.id) {
      this.user = { ...this.user, ...userObject };
      
      // Get user details and freeze status from backend
      this.getUser(userObject.id)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (freezeStatus: boolean) => {
            this.freezeStatus = freezeStatus;
          },
          error: (error) => {
            console.error('Error loading user details:', error);
            // Continue with app initialization even if user details fail
          }
        });
    }
  }

  /**
   * Set welcome message based on registration data
   */
  private setWelcomeMessage(): void {
    if (this.registration?.firstName && this.registration?.lastName) {
      this.loggedinUser = `Welcome: ${this.registration.firstName} ${this.registration.lastName}`;
    } else {
      this.loggedinUser = '';
    }
  }

  /**
   * Handle page restoration from localStorage
   */
  private handlePageRestoration(): void {
    try {
      const storedRoute = localStorage.getItem('page');
      
      if (storedRoute && storedRoute !== '[]') {
        this.currentRoute = JSON.parse(storedRoute);
        
        if (this.currentRoute?.path) {
          // Update registration from localStorage for page restoration
          const userFromStorage = this.getUserFromLocalStorage();
          if (userFromStorage) {
            this.registration = { ...this.registration, ...userFromStorage };
            this.loggedIn.next(true);
            this.router.navigate([`/${this.currentRoute.path}`]);
          }
        }
      }
    } catch (error) {
      console.error('Error during page restoration:', error);
      // Clear invalid data and continue
      localStorage.removeItem('page');
    }
  }

  /**
   * Get user data from localStorage safely
   */
  private getUserFromLocalStorage(): Registration | null {
    try {
      const userString = localStorage.getItem('user');
      if (!userString || userString === '{}' || userString === '[]') {
        return null;
      }
      return JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user'); // Clear invalid data
      return null;
    }
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Get user details from backend
   */
  getUser(userId: number): Observable<boolean> {
    if (!userId) {
      console.warn('Invalid user ID provided to getUser method');
      return of(false);
    }

    return this.regservice.getUser(userId).pipe(
      map((user: Registration) => {
        if (user) {
          this.user = { ...this.user, ...user };
          this.freezeStatus = user.freeze || false;
          return user.freeze || false;
        }
        return false;
      }),
      catchError((error) => {
        console.error('Error fetching user from backend:', error);
        return of(false);
      })
    );
  }

  /**
   * Check freeze status from localStorage and backend
   */
  checkFreezeStatus(): Observable<boolean> {
    const userObject = this.getUserFromLocalStorage();
    
    if (!userObject?.id) {
      console.warn('No valid user found for freeze status check');
      return of(false);
    }

    this.user = { ...this.user, ...userObject };
    return this.getUser(userObject.id);
  }

  /**
   * Toggle freeze status
   */
  toggleFreezeStatus(event: MatSlideToggleChange): void {
    const newStatus = event.checked;
    
    // Optimistically update UI
    this.freezeStatus = newStatus;
    this.user.freeze = newStatus;

    // Update backend
    this.regservice.updateUser(this.user)
      .pipe(
        finalize(() => {
          // Update localStorage regardless of success/failure
          this.updateUserInLocalStorage({ freeze: newStatus });
        })
      )
      .subscribe({
        next: (updatedUser: Registration) => {
          console.log('Freeze status updated successfully:', updatedUser);
        },
        error: (error) => {
          console.error('Error updating freeze status:', error);
          // Revert UI state on error
          this.freezeStatus = !newStatus;
          this.user.freeze = !newStatus;
        }
      });
  }

  /**
   * Update user data in localStorage
   */
  updateUserInLocalStorage(updatedFields: Partial<Registration>): void {
    try {
      const currentUser = this.getUserFromLocalStorage() || {};
      const updatedUserData = { ...currentUser, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error updating user in localStorage:', error);
    }
  }

  /**
   * Navigate to a route and save to localStorage
   */
  navigateurl(route: Route): void {
    if (!route?.path) {
      console.error('Invalid route provided');
      return;
    }

    this.router.navigate([`/${route.path}`]);
    localStorage.setItem('page', JSON.stringify(route));
  }

  /**
   * Navigate and refresh page
   */
  navigateAndRefresh(): void {
    const targetRoute = '/payment';
    
    this.router.navigateByUrl(targetRoute).then(() => {
      window.location.reload();
    });
  }

  /**
   * Handle user logout
   */
  onLogout(): void {
    // Clear authentication
    this.authService.logout();
    
    // Clear all localStorage data
    const keysToRemove = ['user', 'page', 'selectedPaymentItems', 'isLoggedIn', 'loginTime'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reset component state
    this.loggedinUser = '';
    this.registration = undefined;
    this.routes = [];
    this.freezeStatus = false;
    this.loggedIn.next(false);
    
    // Update authentication observable
    this.isLoggedIn$ = this.authService.isLoggedIn;
    
    // Navigate to login
    this.redirectToLogin();
  }

  /**
   * Set landing page
   */
  setLandingPage(route: Route): void {
    this.navigateurl(route);
  }

  /**
   * Toggle badge visibility
   */
  toggleBadgeVisibility(): void {
    this.hidden = !this.hidden;
  }

  /**
   * Get logged in status as observable
   */
  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  ngAfterViewInit(): void {
    // Auto-close drawer on navigation for mobile
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