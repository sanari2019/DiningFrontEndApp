import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get token from token service
    const token = this.tokenService.getToken();

    // Clone request and add authorization header if token exists
    if (token && !this.tokenService.isTokenExpired()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request and catch errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - token expired or invalid
          console.error('Authentication error - redirecting to login');
          this.tokenService.clearTokens();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Forbidden - user doesn't have permission
          console.error('Access forbidden');
        } else if (error.status === 0) {
          // Network error or CORS issue
          console.error('Network error or backend is not accessible');
        } else if (error.status >= 500) {
          // Server error
          console.error('Server error occurred:', error.message);
        }

        return throwError(() => error);
      })
    );
  }
}
