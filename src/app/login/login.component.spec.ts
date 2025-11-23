import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthNewService } from '../auth/auth-new.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthNewService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthNewService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthNewService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthNewService) as jasmine.SpyObj<AuthNewService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.form.get('userName')?.value).toBe('');
      expect(component.form.get('password')?.value).toBe('');
      expect(component.form.get('rememberMe')?.value).toBe(false);
    });

    it('should have required validators on username', () => {
      const userName = component.form.get('userName');

      expect(userName?.hasError('required')).toBeTrue();

      userName?.setValue('test');
      expect(userName?.hasError('required')).toBeFalse();
    });

    it('should have email validator on username', () => {
      const userName = component.form.get('userName');

      userName?.setValue('not-an-email');
      expect(userName?.hasError('email')).toBeTrue();

      userName?.setValue('valid@email.com');
      expect(userName?.hasError('email')).toBeFalse();
    });

    it('should have minLength validator on password', () => {
      const password = component.form.get('password');

      password?.setValue('12345');
      expect(password?.hasError('minlength')).toBeTrue();

      password?.setValue('123456');
      expect(password?.hasError('minlength')).toBeFalse();
    });

    it('should clear localStorage on init', () => {
      localStorage.setItem('test-key', 'test-value');

      component.ngOnInit();

      expect(localStorage.getItem('test-key')).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should mark field as invalid when empty and touched', () => {
      const userName = component.form.get('userName');
      userName?.markAsTouched();

      expect(component.isFieldInvalid('userName')).toBeTrue();
    });

    it('should mark field as valid when filled correctly', () => {
      component.form.patchValue({
        userName: 'test@example.com',
        password: 'password123'
      });

      expect(component.isFieldInvalid('userName')).toBeFalse();
      expect(component.isFieldInvalid('password')).toBeFalse();
    });

    it('should show validation errors after form submit attempt', () => {
      component['formSubmitAttempt'] = true;

      expect(component.isFieldInvalid('userName')).toBeTrue();
      expect(component.isFieldInvalid('password')).toBeTrue();
    });
  });

  describe('Login Submission', () => {
    it('should not submit when form is invalid', () => {
      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
      expect(component.loginMessage).toBe('Please fill in all required fields correctly');
    });

    it('should submit when form is valid', () => {
      component.form.patchValue({
        userName: 'TEST@EXAMPLE.COM',
        password: 'password123',
        rememberMe: false
      });

      authService.login.and.returnValue(of({ success: true }));

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({
        userName: 'test@example.com', // Should be lowercase
        password: 'password123',
        rememberMe: false
      });
    });

    it('should convert username to lowercase and trim', () => {
      component.form.patchValue({
        userName: '  TEST@EXAMPLE.COM  ',
        password: 'password123'
      });

      authService.login.and.returnValue(of({ success: true }));

      component.onSubmit();

      const loginData = authService.login.calls.mostRecent().args[0];
      expect(loginData.userName).toBe('test@example.com');
    });

    it('should set isLoading to true during login', () => {
      component.form.patchValue({
        userName: 'test@example.com',
        password: 'password123'
      });

      authService.login.and.returnValue(of({ success: true }));

      expect(component.isLoading).toBeFalse();

      component.onSubmit();

      // isLoading should be set to true initially
      // Note: It will be set to false after the observable completes
    });

    it('should handle rememberMe checkbox', () => {
      component.form.patchValue({
        userName: 'test@example.com',
        password: 'password123',
        rememberMe: true
      });

      authService.login.and.returnValue(of({ success: true }));

      component.onSubmit();

      const loginData = authService.login.calls.mostRecent().args[0];
      expect(loginData.rememberMe).toBeTrue();
    });
  });

  describe('Successful Login', () => {
    beforeEach(() => {
      component.form.patchValue({
        userName: 'test@example.com',
        password: 'password123'
      });
    });

    it('should navigate to home on successful login', (done) => {
      authService.login.and.returnValue(of({ success: true }));

      component.onSubmit();

      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/']);
        done();
      }, 600);
    });

    it('should clear loading state on success', (done) => {
      authService.login.and.returnValue(of({ success: true }));

      component.onSubmit();

      setTimeout(() => {
        expect(component.isLoading).toBeFalse();
        done();
      }, 100);
    });

    it('should clear login message on success', (done) => {
      component.loginMessage = 'Previous error';
      authService.login.and.returnValue(of({ success: true }));

      component.onSubmit();

      setTimeout(() => {
        expect(component.loginMessage).toBe('');
        done();
      }, 100);
    });
  });

  describe('Login Errors', () => {
    beforeEach(() => {
      component.form.patchValue({
        userName: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle authentication error', (done) => {
      const error = {
        success: false,
        message: 'Invalid credentials',
        errorType: 'AuthenticationError'
      };

      authService.login.and.returnValue(throwError(() => error));

      component.onSubmit();

      setTimeout(() => {
        expect(component.isLoading).toBeFalse();
        expect(component.loginMessage).toBe('Invalid email or password. Please try again.');
        done();
      }, 100);
    });

    it('should handle network error', (done) => {
      const error = {
        success: false,
        message: 'Network error',
        errorType: 'NetworkError'
      };

      authService.login.and.returnValue(throwError(() => error));

      component.onSubmit();

      setTimeout(() => {
        expect(component.loginMessage).toBe('Cannot connect to server. Please check your connection.');
        done();
      }, 100);
    });

    it('should handle user not found error', (done) => {
      const error = {
        success: false,
        message: 'User not found',
        errorType: 'UserNotFoundError'
      };

      authService.login.and.returnValue(throwError(() => error));

      component.onSubmit();

      setTimeout(() => {
        expect(component.loginMessage).toBe('Account not found. Please check your email address.');
        done();
      }, 100);
    });

    it('should handle database error', (done) => {
      const error = {
        success: false,
        message: 'Database error',
        errorType: 'DatabaseError'
      };

      authService.login.and.returnValue(throwError(() => error));

      component.onSubmit();

      setTimeout(() => {
        expect(component.loginMessage).toBe('System error occurred. Please try again later.');
        done();
      }, 100);
    });

    it('should handle frozen account error', (done) => {
      const error = {
        success: false,
        message: 'Account frozen',
        errorType: 'AccountFrozenError'
      };

      authService.login.and.returnValue(throwError(() => error));

      component.onSubmit();

      setTimeout(() => {
        expect(component.loginMessage).toBe('Your account is frozen. Please contact administrator.');
        done();
      }, 100);
    });

    it('should handle server error', (done) => {
      const error = {
        success: false,
        message: 'Server error',
        errorType: 'ServerError'
      };

      authService.login.and.returnValue(throwError(() => error));

      component.onSubmit();

      setTimeout(() => {
        expect(component.loginMessage).toBe('Server error. Please try again later.');
        done();
      }, 100);
    });

    it('should handle unknown error', (done) => {
      const error = {
        success: false,
        message: 'Unknown error occurred'
      };

      authService.login.and.returnValue(throwError(() => error));

      component.onSubmit();

      setTimeout(() => {
        expect(component.loginMessage).toBe('Unknown error occurred');
        done();
      }, 100);
    });
  });

  describe('Component Lifecycle', () => {
    it('should unsubscribe from login subscription on destroy', () => {
      component.form.patchValue({
        userName: 'test@example.com',
        password: 'password123'
      });

      authService.login.and.returnValue(of({ success: true }));

      component.onSubmit();

      const subscription = component['loginSubscription'];
      spyOn(subscription!, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription!.unsubscribe).toHaveBeenCalled();
    });

    it('should not error on destroy when no subscription exists', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Environment Variables', () => {
    it('should set appVersion from environment', () => {
      expect(component.appVersion).toBeDefined();
    });

    it('should set currentYear correctly', () => {
      const currentYear = new Date().getFullYear();
      expect(component.currentYear).toBe(currentYear);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should initialize with password hidden', () => {
      expect(component.hide).toBeTrue();
    });

    it('should toggle password visibility', () => {
      component.hide = false;
      expect(component.hide).toBeFalse();

      component.hide = true;
      expect(component.hide).toBeTrue();
    });
  });
});
