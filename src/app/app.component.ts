import { AfterViewInit, Component, OnInit, ViewChild, HostListener } from '@angular/core';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { catchError, filter, finalize, map } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from './auth/auth.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Registration } from './registration/registration.model';
import { Route } from './shared/route.model';
import { RegistrationService } from './registration/registration.service';
import { LoaderService } from './loader/loader.service';
import { MatAccordion } from '@angular/material/expansion';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { environment } from '../environments/environment';

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
  isHandset = false;
  isAuthPage = false;

  // ViewChild references
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  // Component properties
  title = 'angular-responsive-sidebar';
  loggedinUser = '';
  registration: Registration | undefined;
  routes: Route[] = [];
  hidden = false;
  freezeStatus = false;
  currentRoute: Route | undefined;
  sidebarActive = false;
  appVersion: string = environment.version;
  notifications: string[] = ['Order ready for pickup', 'Voucher expiring soon', 'New meal added', 'Payment received', 'System maintenance'];
  cartItems: Array<{ name: string }> = [{ name: 'Meal A' }, { name: 'Meal B' }, { name: 'Voucher C' }];
  showNotifications = false;
  showProfile = false;
  showCart = false;

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

  @HostListener('document:click', ['$event'])
  closeDropdownsOnOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const withinTop = target.closest('.top-actions');
    if (!withinTop) {
      this.showNotifications = false;
      this.showCart = false;
      this.showProfile = false;
    }
  }

  ngOnInit(): void {
    this.initializeApp();
    this.checkAuthRoute(this.router.url);

    this.bootstrapFromStorage();
    this.ensureRoutesLoaded();

    this.isHandset$
      .pipe(untilDestroyed(this))
      .subscribe((matches) => {
        this.isHandset = matches;
        if (matches) {
          this.sidebarActive = false;
        }
      });

    this.router.events
      .pipe(
        untilDestroyed(this),
        filter((e) => e instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.checkAuthRoute(this.router.url);
      });
  }

  /**
   * Main initialization method
   */
  private initializeApp(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn;

    this.isLoggedIn$
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (isAuthenticated: boolean) => {
          if (isAuthenticated) {
            this.handleAuthenticatedUser();
            this.ensureRoutesLoaded();
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
      // Get registration data from AuthService first
      this.registration = this.authService.registration;

      // If not found in AuthService, try to get from localStorage
      if (!this.registration) {
        console.warn('No registration data found in AuthService, checking localStorage');
        const storedUser = this.getUserFromLocalStorage();
        if (storedUser) {
          this.registration = storedUser;
          // Also update AuthService registration for consistency
          this.authService.registration = storedUser;
        }
      }

      if (!this.registration) {
        console.error('No user data found - redirecting to login');
        this.redirectToLogin();
        return;
      }

      // Keep lightweight user names in sync for initials/display
      this.syncUserFromRegistration();

      // Set welcome message
      this.setWelcomeMessage();

      // Load user data and routes
      this.loadUserDataAndRoutes();
      this.ensureRoutesLoaded();

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
   * Checks both 'user_data' (from AuthNewService/JWT) and 'user' (legacy) keys
   */
  private getUserFromLocalStorage(): Registration | null {
    try {
      // First check user_data (from AuthNewService/JWT login)
      const userDataString = localStorage.getItem('user_data');
      if (userDataString && userDataString !== '{}' && userDataString !== '[]') {
        const userData = JSON.parse(userDataString);
        if (userData && userData.id) {
          return {
            id: userData.id,
            custTypeId: userData.custTypeId,
            custId: userData.custId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            userName: userData.userName,
            password: '',
            freeze: userData.freeze || false,
            autolock: false
          };
        }
      }

      // Fallback to legacy 'user' key
      const userString = localStorage.getItem('user');
      if (!userString || userString === '{}' || userString === '[]') {
        return null;
      }
      return JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
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
    this.closeSidebarAfterNav();
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

    // Clear all localStorage data (including JWT tokens from AuthNewService)
    const keysToRemove = ['user', 'user_data', 'auth_token', 'refresh_token', 'page', 'selectedPaymentItems', 'isLoggedIn', 'loginTime'];
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

  toggleSidebarState(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  toggleNotifications(force?: boolean): void {
    this.showNotifications = typeof force === 'boolean' ? force : !this.showNotifications;
    if (this.showNotifications) {
      this.showCart = false;
      this.showProfile = false;
    }
  }

  toggleCart(force?: boolean): void {
    this.showCart = typeof force === 'boolean' ? force : !this.showCart;
    if (this.showCart) {
      this.showNotifications = false;
      this.showProfile = false;
    }
  }

  toggleProfile(force?: boolean): void {
    this.showProfile = typeof force === 'boolean' ? force : !this.showProfile;
    if (this.showProfile) {
      this.showNotifications = false;
      this.showCart = false;
    }
  }

  navigateHome(): void {
    this.router.navigate(['/']);
    localStorage.removeItem('page');
    this.closeSidebarAfterNav();
  }

  navigateProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateSettings(): void {
    this.router.navigate(['/settings']);
  }

  isHomeActive(): boolean {
    const url = this.router.url || '';
    return url === '/' || url === '/home' || url === '';
  }

  isRouteActive(route: Route): boolean {
    if (!route?.path) {
      return false;
    }
    const current = (this.router.url || '').split('?')[0];
    return current === `/${route.path}` || current === `/${route.path}/`;
  }

  getBoxIcon(route: Route): string {
    const key = (route?.menuName || '').toLowerCase();
    const mapIcons: Record<string, string> = {
      home: 'bxs-home-circle',
      payment: 'bxs-credit-card',
      vouchers: 'bxs-coupon',
      voucher: 'bxs-coupon',
      meals: 'bx-bowl-hot',
      meal: 'bx-bowl-hot',
      servers: 'bx-server',
      administration: 'bxs-cog',
      settings: 'bxs-cog',
      dashboard: 'bxs-dashboard',
      support: 'bxs-help-circle',
      wallet: 'bxs-wallet'
    };
    return mapIcons[key] || 'bx-right-arrow';
  }

  getInitials(reg?: Registration | undefined): string {
    const first = reg?.firstName ? reg.firstName[0] : this.user.firstName ? this.user.firstName[0] : '';
    const last = reg?.lastName ? reg.lastName[0] : this.user.lastName ? this.user.lastName[0] : '';
    const initials = `${first}${last}` || 'C';
    return initials.toUpperCase();
  }

  private checkAuthRoute(url: string): void {
    this.isAuthPage = url.includes('/login') || url.includes('/forgot-password');
  }

  /**
   * Bootstrap auth/route data from localStorage so sidebar routes render without a reload
   */
  private bootstrapFromStorage(): void {
    const storedUser = this.getUserFromLocalStorage();
    if (storedUser) {
      this.registration = storedUser;
      this.authService.registration = storedUser;
      this.syncUserFromRegistration();
      this.loggedIn.next(true);
      if (!this.routes.length) {
        this.loadUserDataAndRoutes();
      }
    }
  }

  /**
   * Ensure routes are loaded when registration is present
   */
  private ensureRoutesLoaded(): void {
    if (this.registration && !this.routes.length) {
      this.loadUserDataAndRoutes();
    }
  }

  /**
   * Keep lightweight user object aligned with registration for initials/display
   */
  private syncUserFromRegistration(): void {
    if (!this.registration) return;
    this.user = {
      ...this.user,
      firstName: this.registration.firstName || this.user.firstName,
      lastName: this.registration.lastName || this.user.lastName,
      userName: this.registration.userName || this.user.userName,
      custId: this.registration.custId || this.user.custId,
      custTypeId: this.registration.custTypeId || this.user.custTypeId,
      id: this.registration.id || this.user.id
    };
  }

  private closeSidebarAfterNav(): void {
    if (this.sidebarActive) {
      this.sidebarActive = false;
    }
  }

  ngAfterViewInit(): void {
    // no-op for now
  }
}
