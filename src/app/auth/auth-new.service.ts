import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuditLogService, AuditLogEntry } from '../services/audit-log.service';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';

// Interfaces for type safety
export interface LoginRequest {
  userName: string;
  password: string;
  rememberMe?: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserData;
}

export interface UserData {
  id: number;
  custTypeId: number;
  custId: string;
  firstName: string;
  lastName: string;
  userName: string;
  freeze: boolean;
  active: boolean;
}

export interface PasswordResetRequest {
  userName: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiError {
  message: string;
  type?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthNewService {
  private loggedIn = new BehaviorSubject<boolean>(this.tokenService.hasToken());
  private currentUserSubject = new BehaviorSubject<UserData | null>(this.tokenService.getUser());

  public isLoggedIn$ = this.loggedIn.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private envUrl: EnvironmentUrlService,
    private auditLogService: AuditLogService
  ) {
    // Check if token is expired on service initialization
    if (this.tokenService.hasToken() && this.tokenService.isTokenExpired()) {
      this.logout();
    }
  }

  /**
   * Get current logged in status
   */
  get isLoggedIn(): Observable<boolean> {
    return this.isLoggedIn$;
  }

  /**
   * Get current user data
   */
  get currentUser(): UserData | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login with username and password
   */
  login(credentials: LoginRequest): Observable<{ success: boolean; message?: string; errorType?: string }> {
    const loginUrl = `${this.envUrl.urlAddress}/auth/login`;

    return this.http.post<TokenResponse>(loginUrl, credentials).pipe(
      tap(response => {
        // Store tokens and user data
        this.tokenService.setToken(response.accessToken);
        this.tokenService.setRefreshToken(response.refreshToken);
        this.tokenService.setUser(response.user);

        // Update observables - IMPORTANT: Set user BEFORE loggedIn to ensure user data is available
        this.currentUserSubject.next(response.user);
        this.loggedIn.next(true);

        this.logLoginEvent(response.user.userName, true, 'Login successful');
      }),
      map(() => ({ success: true })),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error:', error);

        let errorMessage = 'An error occurred during login';
        let errorType = 'UnknownError';

        if (error.error && typeof error.error === 'object') {
          const apiError = error.error as ApiError;
          errorMessage = apiError.message || errorMessage;
          errorType = apiError.type || errorType;
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
          errorType = 'NetworkError';
        } else if (error.status === 401) {
          errorMessage = error.error?.message || 'Invalid username or password';
          errorType = 'AuthenticationError';
        } else if (error.status === 500) {
          errorMessage = error.error?.message || 'Server error occurred. Please try again later.';
          errorType = error.error?.type || 'ServerError';
        }

        this.logLoginEvent(credentials.userName, false, errorMessage, error.status);

        return throwError(() => ({
          success: false,
          message: errorMessage,
          errorType: errorType,
          statusCode: error.status
        }));
      })
    );
  }

  /**
   * Reset password
   */
  resetPassword(request: PasswordResetRequest): Observable<{ success: boolean; message: string; errorType?: string }> {
    const resetUrl = `${this.envUrl.urlAddress}/auth/reset-password`;

    return this.http.post<{ message: string }>(resetUrl, request).pipe(
      map(response => ({
        success: true,
        message: response.message || 'Password has been reset successfully.'
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('Password reset error:', error);

        let errorMessage = 'An error occurred during password reset';
        let errorType = 'UnknownError';

        if (error.error && typeof error.error === 'object') {
          const apiError = error.error as ApiError;
          errorMessage = apiError.message || errorMessage;
          errorType = apiError.type || errorType;
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
          errorType = 'NetworkError';
        } else if (error.status === 404) {
          errorMessage = error.error?.message || 'User not found';
          errorType = 'UserNotFoundError';
        } else if (error.status === 500) {
          errorMessage = error.error?.message || 'Server error occurred. Please try again later.';
          errorType = error.error?.type || 'DatabaseError';
        }

        return throwError(() => ({
          success: false,
          message: errorMessage,
          errorType: errorType
        }));
      })
    );
  }

  /**
   * Verify current token
   */
  verifyToken(): Observable<boolean> {
    const verifyUrl = `${this.envUrl.urlAddress}/auth/verify`;

    return this.http.get(verifyUrl).pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return throwError(() => false);
      })
    );
  }

  /**
   * Get current authenticated user from backend
   */
  getCurrentUser(): Observable<UserData> {
    const meUrl = `${this.envUrl.urlAddress}/auth/me`;

    return this.http.get<UserData>(meUrl).pipe(
      tap(user => {
        this.tokenService.setUser(user);
        this.currentUserSubject.next(user);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching current user:', error);
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear all tokens and user data
    this.tokenService.clearTokens();

    // Update observables
    this.loggedIn.next(false);
    this.currentUserSubject.next(null);

    // Navigate to login
    this.router.navigate(['/login']);

    const userName = this.currentUser?.userName || 'unknown';
    this.logLoginEvent(userName, true, 'Logout', undefined, 'logout');
  }

  /**
   * Check if user account is frozen
   */
  isAccountFrozen(): boolean {
    const user = this.currentUser;
    return user ? user.freeze : false;
  }

  /**
   * Check if user account is active
   */
  isAccountActive(): boolean {
    const user = this.currentUser;
    return user ? user.active : false;
  }

  /**
   * Get user's full name
   */
  getUserFullName(): string {
    const user = this.currentUser;
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  /**
   * Handle error and provide user-friendly message
   */
  private handleError(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      return `Network error: ${error.error.message}`;
    } else {
      // Backend error
      if (error.error && error.error.message) {
        return error.error.message;
      }
      return `Server error (${error.status}): ${error.message}`;
    }
  }

  private logLoginEvent(
    userName: string,
    success: boolean,
    detail?: string,
    statusCode?: number,
    event?: AuditLogEntry['event']
  ): void {
    const eventType: AuditLogEntry['event'] = event ?? (success ? 'login_success' : 'login_failed');
    this.auditLogService.logEvent({
      event: eventType,
      userName,
      success,
      detail,
      statusCode,
      timestamp: new Date().toISOString(),
      source: 'web'
    });
  }
}
