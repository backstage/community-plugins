/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ChatbotApi } from '../ChatbotApi';
import { IdentityApi } from '@backstage/core-plugin-api';

// Mock the window methods
const mockWindowReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockWindowReload },
  writable: true,
});

// Mock console methods (don't suppress, just spy)
let mockConsoleLog: jest.SpyInstance;
let mockConsoleError: jest.SpyInstance;
let mockConsoleWarn: jest.SpyInstance;

describe('ChatbotApi - Authentication Error Handling', () => {
  let mockIdentityApi: jest.Mocked<IdentityApi>;
  let mockOpenIdConnectApi: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Clear any existing toasts
    document.body.innerHTML = '';

    // Set up console spies
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    mockIdentityApi = {
      getCredentials: jest.fn().mockResolvedValue({ token: 'backstage-token' }),
      getProfileInfo: jest.fn(),
      getBackstageIdentity: jest.fn(),
      signOut: jest.fn(),
    };

    mockOpenIdConnectApi = {
      getIdToken: jest.fn(),
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('isAuthError', () => {
    let api: ChatbotApi;

    beforeEach(() => {
      api = new ChatbotApi('http://localhost:8000', {
        identityApi: mockIdentityApi,
      });
    });

    test('should detect 401 error from response.status', () => {
      const error = { response: { status: 401 } };
      // Access the private method via type assertion
      const result = (api as any).isAuthError(error);
      expect(result).toBe(true);
    });

    test('should detect 401 error from error.status', () => {
      const error = { status: 401 };
      const result = (api as any).isAuthError(error);
      expect(result).toBe(true);
    });

    test('should detect 401 error from error message', () => {
      const error = { message: 'Request failed with status code 401' };
      const result = (api as any).isAuthError(error);
      expect(result).toBe(true);
    });

    test('should detect unauthorized error from message text', () => {
      const error = { message: 'Unauthorized access' };
      const result = (api as any).isAuthError(error);
      expect(result).toBe(true);
    });

    test('should NOT detect 403 error', () => {
      const error = { response: { status: 403 } };
      const result = (api as any).isAuthError(error);
      expect(result).toBe(false);
    });

    test('should NOT detect 403 error from message', () => {
      const error = { message: 'Request failed with status code 403' };
      const result = (api as any).isAuthError(error);
      expect(result).toBe(false);
    });

    test('should NOT detect forbidden error from message text', () => {
      const error = { message: 'Forbidden access' };
      const result = (api as any).isAuthError(error);
      expect(result).toBe(false);
    });

    test('should NOT detect other status codes as auth errors', () => {
      const error404 = { response: { status: 404 } };
      const error500 = { response: { status: 500 } };

      expect((api as any).isAuthError(error404)).toBe(false);
      expect((api as any).isAuthError(error500)).toBe(false);
    });

    test('should handle null/undefined errors gracefully', () => {
      expect((api as any).isAuthError(null)).toBe(false);
      expect((api as any).isAuthError(undefined)).toBe(false);
      expect((api as any).isAuthError({})).toBe(false);
    });
  });

  describe('decodeTokenExpiration', () => {
    let api: ChatbotApi;

    beforeEach(() => {
      api = new ChatbotApi('http://localhost:8000', {
        identityApi: mockIdentityApi,
      });
    });

    test('should decode valid JWT token and extract exp claim', () => {
      // Create a valid JWT token with exp claim
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTime, sub: 'user123' };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      const result = (api as any).decodeTokenExpiration(token);
      expect(result).toBe(futureTime);
    });

    test('should handle token with base64 padding correctly', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: futureTime };
      // Use base64url encoding (replace + with - and / with _)
      const encodedPayload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const token = `header.${encodedPayload}.signature`;

      const result = (api as any).decodeTokenExpiration(token);
      expect(result).toBe(futureTime);
    });

    test('should return null for invalid JWT format', () => {
      const invalidToken = 'not.a.valid.jwt.format';
      const result = (api as any).decodeTokenExpiration(invalidToken);
      expect(result).toBeNull();
    });

    test('should return null for token without exp claim', () => {
      const payload = { sub: 'user123', iat: 1234567890 };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      const result = (api as any).decodeTokenExpiration(token);
      expect(result).toBeNull();
    });

    test('should return null for malformed payload', () => {
      const token = 'header.notjson.signature';
      const result = (api as any).decodeTokenExpiration(token);
      expect(result).toBeNull();
    });

    test('should return null for empty token', () => {
      const result = (api as any).decodeTokenExpiration('');
      expect(result).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    let api: ChatbotApi;

    beforeEach(() => {
      api = new ChatbotApi('http://localhost:8000', {
        identityApi: mockIdentityApi,
      });
    });

    test('should return false for valid non-expired token', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      const result = (api as any).isTokenExpired(token);
      expect(result).toBe(false);
    });

    test('should return true for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      const result = (api as any).isTokenExpired(token);
      expect(result).toBe(true);
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Token expired'),
      );
    });

    test('should return true for token expiring exactly now', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const payload = { exp: currentTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      const result = (api as any).isTokenExpired(token);
      expect(result).toBe(true);
    });

    test('should return true for invalid token', () => {
      const result = (api as any).isTokenExpired('invalid.token');
      expect(result).toBe(true);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Unable to determine token expiration, treating as expired',
      );
    });

    test('should return true for token without exp claim', () => {
      const payload = { sub: 'user123' };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      const result = (api as any).isTokenExpired(token);
      expect(result).toBe(true);
    });
  });

  describe('showToastWithCountdown', () => {
    let api: ChatbotApi;

    beforeEach(() => {
      api = new ChatbotApi('http://localhost:8000', {
        identityApi: mockIdentityApi,
      });
    });

    test('should create and display toast with countdown', () => {
      (api as any).showToastWithCountdown('Test message', 5);

      const toasts = document.querySelectorAll('div');
      expect(toasts.length).toBeGreaterThan(0);

      const toast = Array.from(toasts).find(el =>
        el.textContent?.includes('Test message'),
      );
      expect(toast).toBeDefined();
      expect(toast?.textContent).toContain('5 seconds');
    });

    test('should update countdown every second', () => {
      (api as any).showToastWithCountdown('Test message', 3);

      const getToastText = () => {
        const toasts = document.querySelectorAll('div');
        const toast = Array.from(toasts).find(el =>
          el.textContent?.includes('Test message'),
        );
        return toast?.textContent;
      };

      expect(getToastText()).toContain('3 seconds');

      jest.advanceTimersByTime(1000);
      expect(getToastText()).toContain('2 seconds');

      jest.advanceTimersByTime(1000);
      expect(getToastText()).toContain('1 second');
    });

    test('should remove toast after duration', () => {
      (api as any).showToastWithCountdown('Test message', 2);

      expect(document.body.children.length).toBeGreaterThan(0);

      jest.advanceTimersByTime(2000);
      jest.advanceTimersByTime(300); // Animation time

      // Toast should be removed
      const remainingToasts = Array.from(
        document.querySelectorAll('div'),
      ).filter(el => el.textContent?.includes('Test message'));
      expect(remainingToasts.length).toBe(0);
    });

    test('should use singular "second" for 1 second remaining', () => {
      (api as any).showToastWithCountdown('Test message', 1);

      const getToastText = () => {
        const toasts = document.querySelectorAll('div');
        const toast = Array.from(toasts).find(el =>
          el.textContent?.includes('Test message'),
        );
        return toast?.textContent;
      };

      expect(getToastText()).toContain('1 second');
      expect(getToastText()).not.toContain('1 seconds');
    });
  });

  describe('showSessionExpiredToast', () => {
    let api: ChatbotApi;

    beforeEach(() => {
      api = new ChatbotApi('http://localhost:8000', {
        identityApi: mockIdentityApi,
      });
    });

    test('should create and display session expired toast', () => {
      (api as any).showSessionExpiredToast('Session expired message');

      const toast = document.getElementById('session-expired-toast');
      expect(toast).toBeDefined();
      expect(toast?.textContent).toContain('Session expired message');
      expect(toast?.textContent).toContain('🔄 Reload Page');
    });

    test('should not create duplicate toasts', () => {
      (api as any).showSessionExpiredToast('Session expired message');
      (api as any).showSessionExpiredToast('Session expired message');

      const toasts = document.querySelectorAll('#session-expired-toast');
      expect(toasts.length).toBe(1);
    });

    test('reload button should trigger window.location.reload', () => {
      (api as any).showSessionExpiredToast('Session expired message');

      const toast = document.getElementById('session-expired-toast');
      const reloadButton = toast?.querySelector('button');

      expect(reloadButton).toBeDefined();

      reloadButton?.click();

      expect(mockWindowReload).toHaveBeenCalledTimes(1);
    });

    test('should apply correct styling to toast', () => {
      (api as any).showSessionExpiredToast('Session expired message');

      const toast = document.getElementById('session-expired-toast');
      expect(toast?.style.position).toBe('fixed');
      expect(toast?.style.top).toBe('20px');
      expect(toast?.style.backgroundColor).toBe('rgb(211, 47, 47)');
    });
  });

  describe('getToken - OpenID token expiration handling', () => {
    test('should return token from IdentityApi when useOpenIDToken is false', async () => {
      const api = new ChatbotApi(
        'http://localhost:8000',
        { identityApi: mockIdentityApi },
        { useOpenIDToken: false },
      );

      const token = await (api as any).getToken();

      expect(token).toBe('backstage-token');
      expect(mockIdentityApi.getCredentials).toHaveBeenCalled();
    });

    test('should return valid OpenID token when not expired', async () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: futureTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const validToken = `header.${encodedPayload}.signature`;

      mockOpenIdConnectApi.getIdToken.mockResolvedValue(validToken);

      const api = new ChatbotApi(
        'http://localhost:8000',
        {
          identityApi: mockIdentityApi,
          openIdConnectApi: mockOpenIdConnectApi,
        },
        { useOpenIDToken: true, autoReloadOnTokenExpiry: true },
      );

      const token = await (api as any).getToken();

      expect(token).toBe(validToken);
      expect(mockOpenIdConnectApi.getIdToken).toHaveBeenCalled();
    });

    test('should show toast and reload page when OpenID token is expired and autoReload is true', async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const payload = { exp: pastTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const expiredToken = `header.${encodedPayload}.signature`;

      mockOpenIdConnectApi.getIdToken.mockResolvedValue(expiredToken);

      const api = new ChatbotApi(
        'http://localhost:8000',
        {
          identityApi: mockIdentityApi,
          openIdConnectApi: mockOpenIdConnectApi,
        },
        { useOpenIDToken: true, autoReloadOnTokenExpiry: true },
      );

      // Call getToken and immediately advance timers
      const getTokenPromise = (api as any).getToken();

      // Run all pending promises
      await Promise.resolve();

      // Fast-forward through the 5-second delay
      jest.advanceTimersByTime(5000);

      // Run all pending promises again
      await Promise.resolve();

      await expect(getTokenPromise).rejects.toThrow(
        'Authentication token has expired. Reloading page...',
      );

      // Verify console log was called
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(
          'Token expired, showing toast and reloading page',
        ),
      );

      // Verify reload was called
      expect(mockWindowReload).toHaveBeenCalled();
    }, 10000);

    test('should throw error without reload when OpenID token is expired and autoReload is false', async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const payload = { exp: pastTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const expiredToken = `header.${encodedPayload}.signature`;

      mockOpenIdConnectApi.getIdToken.mockResolvedValue(expiredToken);

      const api = new ChatbotApi(
        'http://localhost:8000',
        {
          identityApi: mockIdentityApi,
          openIdConnectApi: mockOpenIdConnectApi,
        },
        { useOpenIDToken: true, autoReloadOnTokenExpiry: false },
      );

      await expect((api as any).getToken()).rejects.toThrow(
        'Authentication token has expired. Please refresh the page to re-authenticate.',
      );

      expect(mockWindowReload).not.toHaveBeenCalled();
    });

    test('should fallback to IdentityApi when openIdConnectApi is not provided', async () => {
      const api = new ChatbotApi(
        'http://localhost:8000',
        { identityApi: mockIdentityApi, openIdConnectApi: null },
        { useOpenIDToken: true },
      );

      const token = await (api as any).getToken();

      expect(token).toBe('backstage-token');
      expect(mockIdentityApi.getCredentials).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining(
          'useOpenIDToken is true but openIdConnectApi is not provided',
        ),
      );
    });
  });

  describe('submitA2ATask - 401 error handling', () => {
    test('should show session expired toast on 401 error', async () => {
      const mockClient = {
        sendMessage: jest.fn().mockRejectedValue({
          response: { status: 401 },
          message: 'Unauthorized',
        }),
      };

      const api = new ChatbotApi('http://localhost:8000', {
        identityApi: mockIdentityApi,
      });

      (api as any).client = mockClient;

      try {
        await api.submitA2ATask(false, 'test message', 'context-123');
      } catch (error) {
        // Expected to throw
      }

      // Allow microtasks to complete
      await Promise.resolve();

      // Verify error was logged
      expect(mockConsoleError).toHaveBeenCalledWith(
        '🔒 Authentication error (401):',
        expect.any(Object),
      );

      // Verify session expired toast was shown
      const toast = document.getElementById('session-expired-toast');
      expect(toast).not.toBeNull();
      expect(toast?.textContent).toContain('session has expired');
    });

    test('should not show session expired toast on non-401 errors', async () => {
      const mockClient = {
        sendMessage: jest.fn().mockRejectedValue({
          response: { status: 500 },
          message: 'Internal Server Error',
        }),
      };

      const api = new ChatbotApi('http://localhost:8000', {
        identityApi: mockIdentityApi,
      });

      (api as any).client = mockClient;

      try {
        await api.submitA2ATask(false, 'test message', 'context-123');
      } catch (error) {
        // Expected to throw
      }

      // Verify session expired toast was NOT shown
      const toast = document.getElementById('session-expired-toast');
      expect(toast).toBeNull();
    });
  });
});
