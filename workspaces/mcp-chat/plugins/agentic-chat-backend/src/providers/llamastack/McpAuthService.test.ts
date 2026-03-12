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
import type { LoggerService } from '@backstage/backend-plugin-api';
import { MCPAuthConfig } from '../../types';
import { McpAuthService } from './McpAuthService';
import { createMockLogger } from '../../test-utils/mocks';

describe('McpAuthService', () => {
  const mockLogger = createMockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates an instance with no MCP auth configs', () => {
      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );
      expect(service).toBeDefined();
    });

    it('creates an instance with security mode full', () => {
      const service = new McpAuthService(
        { mode: 'full' },
        new Map([
          [
            'mcp-1',
            {
              type: 'oauth',
              tokenUrl: 'http://keycloak/token',
              clientId: 'c',
              clientSecret: 's',
            },
          ],
        ]),
        mockLogger as unknown as LoggerService,
        false,
      );
      expect(service).toBeDefined();
    });
  });

  describe('getServerHeaders', () => {
    it('returns empty headers when mode is none', async () => {
      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );
      const headers = await service.getServerHeaders({
        id: 'test',
        name: 'Test',
        url: 'http://localhost:3000',
        type: 'streamable-http',
      });
      expect(headers).toEqual({});
    });

    it('returns empty headers when no auth config matches the server', async () => {
      const service = new McpAuthService(
        { mode: 'full' },
        new Map([
          [
            'other-server',
            {
              type: 'oauth',
              tokenUrl: 'http://keycloak/token',
              clientId: 'c',
              clientSecret: 's',
            },
          ],
        ]),
        mockLogger as unknown as LoggerService,
        false,
      );
      const headers = await service.getServerHeaders({
        id: 'test',
        name: 'Test',
        url: 'http://localhost:3000',
        type: 'streamable-http',
      });
      expect(headers).toEqual({});
    });
  });

  describe('getServerHeaders - null token warnings', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('logs warning when authRef OAuth token returns null', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
        json: () => Promise.resolve({}),
      });

      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>([
          [
            'my-auth',
            {
              type: 'oauth',
              tokenUrl: 'http://keycloak/token',
              clientId: 'c',
              clientSecret: 's',
            },
          ],
        ]),
        mockLogger as unknown as LoggerService,
        false,
      );

      const headers = await service.getServerHeaders({
        id: 'srv-1',
        name: 'Server 1',
        url: 'http://mcp.example.com',
        type: 'streamable-http',
        authRef: 'my-auth',
      });

      expect(headers.Authorization).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'OAuth token via authRef "my-auth" returned null',
        ),
      );
    });

    it('logs warning when inline OAuth token returns null', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server Error'),
        json: () => Promise.resolve({}),
      });

      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );

      const headers = await service.getServerHeaders({
        id: 'srv-2',
        name: 'Server 2',
        url: 'http://mcp.example.com',
        type: 'streamable-http',
        oauth: {
          tokenUrl: 'http://keycloak/token',
          clientId: 'c',
          clientSecret: 's',
        },
      });

      expect(headers.Authorization).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('inline OAuth token returned null'),
      );
    });

    it('sets Authorization header when OAuth token succeeds', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({ access_token: 'test-token', expires_in: 300 }),
          ),
        json: () =>
          Promise.resolve({ access_token: 'test-token', expires_in: 300 }),
      });

      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );

      const headers = await service.getServerHeaders({
        id: 'srv-3',
        name: 'Server 3',
        url: 'http://mcp.example.com',
        type: 'streamable-http',
        oauth: {
          tokenUrl: 'http://keycloak/token',
          clientId: 'c',
          clientSecret: 's',
        },
      });

      expect(headers.Authorization).toBe('Bearer test-token');
      expect(mockLogger.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('returned null'),
      );
    });

    it('caches OAuth token on subsequent calls', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({ access_token: 'cached-token', expires_in: 3600 }),
          ),
        json: () =>
          Promise.resolve({ access_token: 'cached-token', expires_in: 3600 }),
      });
      global.fetch = mockFetch;

      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );

      const server = {
        id: 'srv-cache',
        name: 'Cache Server',
        url: 'http://mcp.example.com',
        type: 'streamable-http' as const,
        oauth: {
          tokenUrl: 'http://keycloak/token',
          clientId: 'c',
          clientSecret: 's',
        },
      };

      await service.getServerHeaders(server);
      await service.getServerHeaders(server);

      // Only one actual fetch should occur (second should hit cache)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent OAuth token requests', async () => {
      let resolveToken: (v: unknown) => void;
      const tokenPromise = new Promise(resolve => {
        resolveToken = resolve;
      });

      const mockFetch = jest.fn().mockImplementation(() => tokenPromise);
      global.fetch = mockFetch;

      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );

      const server = {
        id: 'srv-dedup',
        name: 'Dedup Server',
        url: 'http://mcp.example.com',
        type: 'streamable-http' as const,
        oauth: {
          tokenUrl: 'http://keycloak/token',
          clientId: 'c',
          clientSecret: 's',
        },
      };

      // Fire two concurrent requests
      const p1 = service.getServerHeaders(server);
      const p2 = service.getServerHeaders(server);

      // Resolve the shared promise
      resolveToken!({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({ access_token: 'dedup-token', expires_in: 300 }),
          ),
        json: () =>
          Promise.resolve({ access_token: 'dedup-token', expires_in: 300 }),
      });

      const [h1, h2] = await Promise.all([p1, p2]);

      expect(h1.Authorization).toBe('Bearer dedup-token');
      expect(h2.Authorization).toBe('Bearer dedup-token');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('logs warning for unknown authRef', async () => {
      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );

      await service.getServerHeaders({
        id: 'srv-missing',
        name: 'Missing Auth',
        url: 'http://mcp.example.com',
        type: 'streamable-http',
        authRef: 'nonexistent',
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('references unknown auth config: nonexistent'),
      );
    });

    it('preserves static headers from server config', async () => {
      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );

      const headers = await service.getServerHeaders({
        id: 'srv-static',
        name: 'Static Headers',
        url: 'http://mcp.example.com',
        type: 'streamable-http',
        headers: { 'X-Custom': 'value' },
      });

      expect(headers['X-Custom']).toBe('value');
    });
  });

  describe('getApiApprovalConfig', () => {
    it('returns "never" when no config is provided', () => {
      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );
      expect(service.getApiApprovalConfig(undefined)).toBe('never');
    });

    it('returns "always" when configured as string', () => {
      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );
      expect(service.getApiApprovalConfig('always')).toBe('always');
    });

    it('returns "never" when configured as string', () => {
      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );
      expect(service.getApiApprovalConfig('never')).toBe('never');
    });

    it('falls back to "never" for object format (Llama Stack limitation) and logs warning', () => {
      const service = new McpAuthService(
        { mode: 'none' },
        new Map<string, MCPAuthConfig>(),
        mockLogger as unknown as LoggerService,
        false,
      );
      const result = service.getApiApprovalConfig({
        always: ['tool1'],
        never: ['tool2'],
      });
      expect(result).toBe('never');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('does not support per-tool require_approval'),
      );
    });
  });
});
