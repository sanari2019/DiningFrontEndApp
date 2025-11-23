import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Token Management', () => {
    it('should store and retrieve access token', () => {
      const testToken = 'test-access-token-12345';

      service.setToken(testToken);
      const retrieved = service.getToken();

      expect(retrieved).toBe(testToken);
    });

    it('should store and retrieve refresh token', () => {
      const testRefreshToken = 'test-refresh-token-67890';

      service.setRefreshToken(testRefreshToken);
      const retrieved = service.getRefreshToken();

      expect(retrieved).toBe(testRefreshToken);
    });

    it('should return null when token does not exist', () => {
      const token = service.getToken();

      expect(token).toBeNull();
    });

    it('should return null when refresh token does not exist', () => {
      const refreshToken = service.getRefreshToken();

      expect(refreshToken).toBeNull();
    });

    it('should check if token exists', () => {
      expect(service.hasToken()).toBeFalse();

      service.setToken('test-token');

      expect(service.hasToken()).toBeTrue();
    });
  });

  describe('User Data Management', () => {
    it('should store and retrieve user data', () => {
      const testUser = {
        id: 1,
        userName: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        custId: 'CUST001',
        custTypeId: 1,
        freeze: false,
        active: true
      };

      service.setUser(testUser);
      const retrieved = service.getUser();

      expect(retrieved).toEqual(testUser);
    });

    it('should return null when user data does not exist', () => {
      const user = service.getUser();

      expect(user).toBeNull();
    });

    it('should handle complex user objects', () => {
      const complexUser = {
        id: 99,
        userName: 'complex@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        custId: 'CUST999',
        custTypeId: 2,
        freeze: true,
        active: false,
        additionalData: {
          department: 'IT',
          role: 'Admin'
        }
      };

      service.setUser(complexUser);
      const retrieved = service.getUser();

      expect(retrieved).toEqual(complexUser);
      expect(retrieved.additionalData.department).toBe('IT');
    });
  });

  describe('Token Expiration', () => {
    it('should detect expired token', () => {
      // Create an expired JWT token (exp in the past)
      const expiredToken = createMockJWT({ exp: Math.floor(Date.now() / 1000) - 3600 });

      service.setToken(expiredToken);

      expect(service.isTokenExpired()).toBeTrue();
    });

    it('should detect valid token', () => {
      // Create a valid JWT token (exp in the future)
      const validToken = createMockJWT({ exp: Math.floor(Date.now() / 1000) + 3600 });

      service.setToken(validToken);

      expect(service.isTokenExpired()).toBeFalse();
    });

    it('should return true for expired check when token does not exist', () => {
      expect(service.isTokenExpired()).toBeTrue();
    });

    it('should return true for expired check when token is malformed', () => {
      service.setToken('not-a-valid-jwt-token');

      expect(service.isTokenExpired()).toBeTrue();
    });

    it('should handle token without expiration claim', () => {
      const tokenWithoutExp = createMockJWT({});

      service.setToken(tokenWithoutExp);

      expect(service.isTokenExpired()).toBeTrue();
    });
  });

  describe('Clear Tokens', () => {
    it('should clear all tokens and user data', () => {
      service.setToken('test-token');
      service.setRefreshToken('test-refresh-token');
      service.setUser({ id: 1, userName: 'test@example.com' });
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginTime', Date.now().toString());

      service.clearTokens();

      expect(service.getToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getUser()).toBeNull();
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
      expect(localStorage.getItem('loginTime')).toBeNull();
    });

    it('should clear page and selectedPaymentItems', () => {
      localStorage.setItem('page', '2');
      localStorage.setItem('selectedPaymentItems', JSON.stringify([1, 2, 3]));

      service.clearTokens();

      expect(localStorage.getItem('page')).toBeNull();
      expect(localStorage.getItem('selectedPaymentItems')).toBeNull();
    });

    it('should not throw error when clearing non-existent tokens', () => {
      expect(() => service.clearTokens()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully when storing token', () => {
      spyOn(localStorage, 'setItem').and.throwError('Storage full');
      spyOn(console, 'error');

      expect(() => service.setToken('test-token')).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully when retrieving token', () => {
      spyOn(localStorage, 'getItem').and.throwError('Storage error');
      spyOn(console, 'error');

      const result = service.getToken();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle JSON parse errors for user data', () => {
      spyOn(console, 'error');
      localStorage.setItem('user_data', 'invalid-json');

      const result = service.getUser();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors when clearing tokens', () => {
      spyOn(localStorage, 'removeItem').and.throwError('Remove error');
      spyOn(console, 'error');

      expect(() => service.clearTokens()).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Token Payload Decoding', () => {
    it('should correctly decode token payload', () => {
      const payload = {
        sub: '123',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      const token = createMockJWT(payload);
      service.setToken(token);

      expect(service.isTokenExpired()).toBeFalse();
    });

    it('should handle special characters in payload', () => {
      const payload = {
        email: 'test+special@example.com',
        name: 'John O\'Brien',
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      const token = createMockJWT(payload);
      service.setToken(token);

      expect(service.isTokenExpired()).toBeFalse();
    });
  });

  describe('Multiple Token Operations', () => {
    it('should handle rapid token updates', () => {
      for (let i = 0; i < 100; i++) {
        service.setToken(`token-${i}`);
      }

      expect(service.getToken()).toBe('token-99');
    });

    it('should maintain token integrity across multiple operations', () => {
      const token = 'original-token';
      const user = { id: 1, userName: 'test@example.com' };

      service.setToken(token);
      service.setUser(user);
      service.setRefreshToken('refresh-token');

      expect(service.getToken()).toBe(token);
      expect(service.getUser()).toEqual(user);
      expect(service.getRefreshToken()).toBe('refresh-token');
    });
  });
});

// Helper function to create mock JWT tokens
function createMockJWT(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
