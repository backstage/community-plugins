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

import { NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { createSecurityMiddleware } from './security';
import { createMockLogger, createMockResponse } from '../test-utils/mocks';
import type express from 'express';

function createMockRequest(
  overrides?: Partial<express.Request>,
): express.Request {
  return {
    ...overrides,
  } as express.Request;
}

function createMockNext(): express.NextFunction {
  return jest.fn();
}

describe('createSecurityMiddleware', () => {
  const mockLogger = createMockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requirePluginAccess', () => {
    it('calls next() when security mode is "none"', async () => {
      const next = createMockNext();
      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'none',
        permissionsEnabled: false,
      });

      await middleware.requirePluginAccess(
        createMockRequest(),
        createMockResponse(),
        next,
      );

      expect(next).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Security mode is "none" - skipping access control',
      );
    });

    it('calls next() when credentials and permission check succeed', async () => {
      const next = createMockNext();
      const res = createMockResponse();
      const mockCredentials = jest.fn().mockResolvedValue({
        principal: { type: 'user', userEntityRef: 'user:default/alice' },
      });
      const mockAuthorize = jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]);

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: mockAuthorize,
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: true,
      });

      await middleware.requirePluginAccess(createMockRequest(), res, next);

      expect(mockCredentials).toHaveBeenCalled();
      expect(mockAuthorize).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('sends 403 when permission is DENY', async () => {
      const next = createMockNext();
      const res = createMockResponse();
      const mockCredentials = jest.fn().mockResolvedValue({
        principal: { type: 'user', userEntityRef: 'user:default/bob' },
      });
      const mockAuthorize = jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.DENY }]);

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: mockAuthorize,
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: true,
      });

      await middleware.requirePluginAccess(createMockRequest(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access Denied',
          message: expect.any(String),
        }),
      );
    });

    it('sends 403 with custom accessDeniedMessage when provided', async () => {
      const next = createMockNext();
      const res = createMockResponse();
      const mockCredentials = jest.fn().mockResolvedValue({});
      const mockAuthorize = jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.DENY }]);

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: mockAuthorize,
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: true,
        accessDeniedMessage: 'Custom access denied message',
      });

      await middleware.requirePluginAccess(createMockRequest(), res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access Denied',
          message: 'Custom access denied message',
        }),
      );
    });

    it('sends 401 when credentials fail (not NotAllowedError)', async () => {
      const next = createMockNext();
      const res = createMockResponse();
      const mockCredentials = jest
        .fn()
        .mockRejectedValue(new Error('No token'));

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: true,
      });

      await middleware.requirePluginAccess(createMockRequest(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
          message: 'You must be logged in to access Agentic Chat',
        }),
      );
    });

    it('sends 403 when NotAllowedError is thrown', async () => {
      const next = createMockNext();
      const res = createMockResponse();
      const mockCredentials = jest
        .fn()
        .mockRejectedValue(new NotAllowedError('Not allowed'));

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: true,
      });

      await middleware.requirePluginAccess(createMockRequest(), res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access Denied',
          message: 'Not allowed',
        }),
      );
    });
  });

  describe('checkIsAdmin', () => {
    it('returns true when security mode is "none"', async () => {
      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'none',
        permissionsEnabled: false,
      });

      const result = await middleware.checkIsAdmin(createMockRequest());

      expect(result).toBe(true);
    });

    it('returns true when permissionsEnabled and RBAC allows', async () => {
      const mockCredentials = jest.fn().mockResolvedValue({
        principal: { type: 'user', userEntityRef: 'user:default/admin' },
      });
      const mockAuthorize = jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]);

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: mockAuthorize,
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: true,
      });

      const result = await middleware.checkIsAdmin(createMockRequest());

      expect(result).toBe(true);
    });

    it('returns false when permissionsEnabled and RBAC denies', async () => {
      const mockCredentials = jest.fn().mockResolvedValue({
        principal: { type: 'user', userEntityRef: 'user:default/user1' },
      });
      const mockAuthorize = jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.DENY }]);

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: mockAuthorize,
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: true,
      });

      const result = await middleware.checkIsAdmin(createMockRequest());

      expect(result).toBe(false);
    });

    it('returns false when permissionsEnabled and credentials throw', async () => {
      const mockCredentials = jest
        .fn()
        .mockRejectedValue(new Error('Auth failed'));

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: true,
      });

      const result = await middleware.checkIsAdmin(createMockRequest());

      expect(result).toBe(false);
    });

    it('returns true when adminUsers includes user ref', async () => {
      const mockCredentials = jest.fn().mockResolvedValue({
        principal: { type: 'user', userEntityRef: 'user:default/admin' },
      });

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: false,
        adminUsers: ['user:default/admin', 'user:default/other'],
      });

      const result = await middleware.checkIsAdmin(createMockRequest());

      expect(result).toBe(true);
    });

    it('returns false when adminUsers does not include user ref', async () => {
      const mockCredentials = jest.fn().mockResolvedValue({
        principal: { type: 'user', userEntityRef: 'user:default/regular' },
      });

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: false,
        adminUsers: ['user:default/admin'],
      });

      const result = await middleware.checkIsAdmin(createMockRequest());

      expect(result).toBe(false);
    });

    it('returns false when adminUsers is empty or undefined', async () => {
      const mockCredentials = jest.fn().mockResolvedValue({
        principal: { type: 'user', userEntityRef: 'user:default/admin' },
      });

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: false,
        adminUsers: [],
      });

      const result = await middleware.checkIsAdmin(createMockRequest());

      expect(result).toBe(false);
    });
  });

  describe('getUserRef', () => {
    it('returns GUEST_USER_REF when security mode is "none"', async () => {
      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'none',
        permissionsEnabled: false,
      });

      const result = await middleware.getUserRef(createMockRequest());

      expect(result).toBe('user:default/guest');
    });

    it('returns user ref from credentials when available', async () => {
      const mockCredentials = jest.fn().mockResolvedValue({
        principal: { type: 'user', userEntityRef: 'user:default/alice' },
      });

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: false,
      });

      const result = await middleware.getUserRef(createMockRequest());

      expect(result).toBe('user:default/alice');
      expect(mockCredentials).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ allow: ['user'] }),
      );
    });

    it('returns GUEST_USER_REF when credentials throw (fallback for guests)', async () => {
      const mockCredentials = jest.fn().mockRejectedValue(new Error('No user'));

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: jest.fn(),
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: false,
      });

      const result = await middleware.getUserRef(createMockRequest());

      expect(result).toBe('user:default/guest');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not extract user identity'),
      );
    });
  });

  describe('requireAdminAccess', () => {
    it('calls next() when checkIsAdmin returns true', async () => {
      const next = createMockNext();
      const mockCredentials = jest.fn().mockResolvedValue({
        principal: { type: 'user', userEntityRef: 'user:default/admin' },
      });
      const mockAuthorize = jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]);

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: mockAuthorize,
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: true,
      });

      await middleware.requireAdminAccess(
        createMockRequest(),
        createMockResponse(),
        next,
      );

      expect(next).toHaveBeenCalled();
    });

    it('sends 403 when checkIsAdmin returns false', async () => {
      const next = createMockNext();
      const res = createMockResponse();
      const mockCredentials = jest.fn().mockResolvedValue({
        principal: { type: 'user', userEntityRef: 'user:default/regular' },
      });
      const mockAuthorize = jest
        .fn()
        .mockResolvedValue([{ result: AuthorizeResult.DENY }]);

      const middleware = createSecurityMiddleware({
        logger: mockLogger,
        httpAuth: {
          credentials: mockCredentials,
        } as unknown as import('@backstage/backend-plugin-api').HttpAuthService,
        permissions: {
          authorize: mockAuthorize,
        } as unknown as import('@backstage/backend-plugin-api').PermissionsService,
        securityMode: 'plugin-only',
        permissionsEnabled: true,
      });

      await middleware.requireAdminAccess(createMockRequest(), res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Admin Access Denied',
          message: expect.stringContaining('admin permissions'),
        }),
      );
    });
  });
});
