import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthNewService, LoginRequest, TokenResponse, UserData } from './auth-new.service';
import { TokenService } from '../services/token.service';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';

describe('AuthNewService', () => {
  let service: AuthNewService;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;
  let envService: jasmine.SpyObj<EnvironmentUrlService>;

  const mockEnvService = {
    urlAddress: 'http://localhost:5057'
  };

  const mockTokenResponse: TokenResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      id: 1,
      userName: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      custId: 'CUST001',
      custTypeId: 1,
      freeze: false,
      active: true
    }
  };

  beforeEach(() => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', [
      'setToken',
      'setRefreshToken',
      'setUser',
      'getToken',
      'hasToken',
      'clearTokens'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthNewService,
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: EnvironmentUrlService, useValue: mockEnvService }
      ]
    });

    service = TestBed.inject(AuthNewService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    envService = TestBed.inject(EnvironmentUrlService) as jasmine.SpyObj<EnvironmentUrlService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', (done) => {
      const credentials: LoginRequest = {
        userName: 'test@example.com',
        password: 'TestPassword123',
        rememberMe: false
      };

      service.login(credentials).subscribe({
        next: (result) => {
          expect(result.success).toBeTrue();
          expect(tokenService.setToken).toHaveBeenCalledWith(mockTokenResponse.accessToken);
          expect(tokenService.setRefreshToken).toHaveBeenCalledWith(mockTokenResponse.refreshToken);
          expect(tokenService.setUser).toHaveBeenCalledWith(mockTokenResponse.user);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockEnvService.urlAddress}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockTokenResponse);
    });

    it('should handle authentication error on invalid credentials', (done) => {
      const credentials: LoginRequest = {
        userName: 'test@example.com',
        password: 'WrongPassword',
        rememberMe: false
      };

      service.login(credentials).subscribe({
        error: (error) => {
          expect(error.success).toBeFalse();
          expect(error.errorType).toBe('AuthenticationError');
          expect(error.message).toContain('Invalid');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockEnvService.urlAddress}/auth/login`);
      req.flush(
        { message: 'Invalid username or password', type: 'AuthenticationError' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });

    it('should handle network error', (done) => {
      const credentials: LoginRequest = {
        userName: 'test@example.com',
        password: 'TestPassword123',
        rememberMe: false
      };

      service.login(credentials).subscribe({
        error: (error) => {
          expect(error.success).toBeFalse();
          expect(error.errorType).toBe('NetworkError');
          expect(error.message).toContain('Cannot connect to server');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockEnvService.urlAddress}/auth/login`);
      req.error(new ProgressEvent('Network error'), { status: 0, statusText: 'Unknown Error' });
    });

    it('should handle server error', (done) => {
      const credentials: LoginRequest = {
        userName: 'test@example.com',
        password: 'TestPassword123',
        rememberMe: false
      };

      service.login(credentials).subscribe({
        error: (error) => {
          expect(error.success).toBeFalse();
          expect(error.errorType).toBe('ServerError');
          expect(error.statusCode).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockEnvService.urlAddress}/auth/login`);
      req.flush(
        { message: 'Server error occurred', type: 'ServerError' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should emit loggedIn observable on successful login', (done) => {
      const credentials: LoginRequest = {
        userName: 'test@example.com',
        password: 'TestPassword123',
        rememberMe: false
      };

      service.isLoggedIn$.subscribe(isLoggedIn => {
        if (isLoggedIn) {
          expect(isLoggedIn).toBeTrue();
          done();
        }
      });

      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${mockEnvService.urlAddress}/auth/login`);
      req.flush(mockTokenResponse);
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password for valid user', (done) => {
      const userName = 'test@example.com';
      const newPassword = 'NewPassword123';

      service.resetPassword(userName, newPassword).subscribe({
        next: (result) => {
          expect(result.success).toBeTrue();
          expect(result.message).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(`${mockEnvService.urlAddress}/auth/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userName, newPassword });
      req.flush({ message: 'Password reset successfully', success: true });
    });

    it('should handle user not found error', (done) => {
      const userName = 'nonexistent@example.com';
      const newPassword = 'NewPassword123';

      service.resetPassword(userName, newPassword).subscribe({
        error: (error) => {
          expect(error.success).toBeFalse();
          expect(error.errorType).toBe('UserNotFoundError');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockEnvService.urlAddress}/auth/reset-password`);
      req.flush(
        { message: 'User not found', type: 'UserNotFoundError' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should handle database error during reset', (done) => {
      const userName = 'test@example.com';
      const newPassword = 'NewPassword123';

      service.resetPassword(userName, newPassword).subscribe({
        error: (error) => {
          expect(error.success).toBeFalse();
          expect(error.errorType).toBe('DatabaseError');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockEnvService.urlAddress}/auth/reset-password`);
      req.flush(
        { message: 'Database error occurred', type: 'DatabaseError' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('logout', () => {
    it('should clear tokens and update observables', (done) => {
      service.logout();

      expect(tokenService.clearTokens).toHaveBeenCalled();

      service.isLoggedIn$.subscribe(isLoggedIn => {
        expect(isLoggedIn).toBeFalse();
      });

      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from token service', () => {
      const mockUser: UserData = {
        id: 1,
        userName: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        custId: 'CUST001',
        custTypeId: 1,
        freeze: false,
        active: true
      };

      tokenService.getUser = jasmine.createSpy().and.returnValue(mockUser);

      const result = service.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user is logged in', () => {
      tokenService.getUser = jasmine.createSpy().and.returnValue(null);

      const result = service.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      tokenService.hasToken.and.returnValue(true);

      expect(service.isLoggedIn).toBeTrue();
    });

    it('should return false when no token exists', () => {
      tokenService.hasToken.and.returnValue(false);

      expect(service.isLoggedIn).toBeFalse();
    });
  });

  describe('error handling', () => {
    it('should handle validation errors', (done) => {
      const credentials: LoginRequest = {
        userName: '',
        password: '123',
        rememberMe: false
      };

      service.login(credentials).subscribe({
        error: (error) => {
          expect(error.success).toBeFalse();
          expect(error.errorType).toBe('ValidationError');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockEnvService.urlAddress}/auth/login`);
      req.flush(
        { message: 'Invalid request', type: 'ValidationError' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle frozen account error', (done) => {
      const credentials: LoginRequest = {
        userName: 'frozen@example.com',
        password: 'TestPassword123',
        rememberMe: false
      };

      service.login(credentials).subscribe({
        error: (error) => {
          expect(error.success).toBeFalse();
          expect(error.message).toContain('frozen');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockEnvService.urlAddress}/auth/login`);
      req.flush(
        { message: 'Account is frozen. Please contact administrator.', type: 'AccountFrozenError' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });
});
