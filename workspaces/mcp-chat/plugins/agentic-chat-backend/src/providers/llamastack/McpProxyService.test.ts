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

import { McpProxyService } from './McpProxyService';
import type { McpToolsCache } from './McpProxyService';

jest.mock('../../services/utils/http', () => ({
  fetchWithTlsControl: jest.fn(),
  parseJsonRpcFromResponse: jest.fn(),
}));

jest.mock('../../services/utils/SsrfGuard', () => ({
  isPrivateUrl: jest.fn().mockReturnValue(null),
}));

import {
  fetchWithTlsControl,
  parseJsonRpcFromResponse,
} from '../../services/utils/http';
import { isPrivateUrl } from '../../services/utils/SsrfGuard';

const mockFetch = fetchWithTlsControl as jest.MockedFunction<
  typeof fetchWithTlsControl
>;
const mockParseJsonRpc = parseJsonRpcFromResponse as jest.MockedFunction<
  typeof parseJsonRpcFromResponse
>;
const mockIsPrivateUrl = isPrivateUrl as jest.MockedFunction<
  typeof isPrivateUrl
>;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
} as import('@backstage/backend-plugin-api').LoggerService;

function createProxy() {
  return new McpProxyService({
    logger: mockLogger,
    mcpAuth: {
      getServerHeaders: jest.fn().mockResolvedValue({
        Authorization: 'Bearer test-token',
      }),
    } as unknown as import('./McpAuthService').McpAuthService,
    skipTlsVerify: false,
    proxyBaseUrl: 'http://localhost:7007/api/agentic-chat',
  });
}

function registerServers(proxy: McpProxyService) {
  proxy.updateServers([
    {
      id: 'aap-mcp',
      name: 'AAP',
      type: 'streamable-http' as const,
      url: 'https://aap.example.com/mcp',
    },
    {
      id: 'ocp-mcp',
      name: 'OCP',
      type: 'streamable-http' as const,
      url: 'https://ocp.example.com/mcp',
    },
  ]);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPrivateUrl.mockReturnValue(null);
});

describe('McpProxyService', () => {
  describe('getPrefix', () => {
    it('replaces dashes with underscores and appends double underscore', () => {
      expect(McpProxyService.getPrefix('aap-mcp')).toBe('aap_mcp__');
      expect(McpProxyService.getPrefix('ocp-mcp')).toBe('ocp_mcp__');
    });

    it('handles IDs without dashes', () => {
      expect(McpProxyService.getPrefix('server1')).toBe('server1__');
    });

    it('handles IDs with multiple dashes', () => {
      expect(McpProxyService.getPrefix('my-cool-server')).toBe(
        'my_cool_server__',
      );
    });
  });

  describe('stripPrefix', () => {
    it('strips the correct prefix for a server ID', () => {
      const result = McpProxyService.stripPrefix(
        'aap_mcp__projects_list',
        'aap-mcp',
      );
      expect(result).toBe('projects_list');
    });

    it('returns undefined when prefix does not match', () => {
      const result = McpProxyService.stripPrefix(
        'ocp_mcp__projects_list',
        'aap-mcp',
      );
      expect(result).toBeUndefined();
    });

    it('handles tool names without prefix', () => {
      const result = McpProxyService.stripPrefix('projects_list', 'aap-mcp');
      expect(result).toBeUndefined();
    });
  });

  describe('detectConflicts', () => {
    it('returns no conflicts when tools are unique', () => {
      const cache: McpToolsCache = new Map([
        ['server-a', ['tool1', 'tool2']],
        ['server-b', ['tool3', 'tool4']],
      ]);
      const result = McpProxyService.detectConflicts(cache);
      expect(result.enabled).toBe(false);
      expect(result.conflictingTools).toEqual([]);
    });

    it('detects conflicting tool names across servers', () => {
      const cache: McpToolsCache = new Map([
        ['aap-mcp', ['projects_list', 'job_templates_list']],
        ['ocp-mcp', ['projects_list', 'pods_list']],
      ]);
      const result = McpProxyService.detectConflicts(cache);
      expect(result.enabled).toBe(true);
      expect(result.conflictingTools).toEqual(['projects_list']);
    });

    it('detects multiple conflicting tools', () => {
      const cache: McpToolsCache = new Map([
        ['server-a', ['shared1', 'shared2', 'unique_a']],
        ['server-b', ['shared1', 'shared2', 'unique_b']],
      ]);
      const result = McpProxyService.detectConflicts(cache);
      expect(result.enabled).toBe(true);
      expect(result.conflictingTools).toEqual(['shared1', 'shared2']);
    });

    it('returns no conflicts for empty cache', () => {
      const cache: McpToolsCache = new Map();
      const result = McpProxyService.detectConflicts(cache);
      expect(result.enabled).toBe(false);
      expect(result.conflictingTools).toEqual([]);
    });

    it('returns no conflicts for single server', () => {
      const cache: McpToolsCache = new Map([['server-a', ['tool1', 'tool2']]]);
      const result = McpProxyService.detectConflicts(cache);
      expect(result.enabled).toBe(false);
      expect(result.conflictingTools).toEqual([]);
    });

    it('detects conflicts across three servers', () => {
      const cache: McpToolsCache = new Map([
        ['server-a', ['shared_tool']],
        ['server-b', ['unique_tool']],
        ['server-c', ['shared_tool']],
      ]);
      const result = McpProxyService.detectConflicts(cache);
      expect(result.enabled).toBe(true);
      expect(result.conflictingTools).toEqual(['shared_tool']);
    });
  });

  describe('getProxyUrl', () => {
    it('constructs the correct proxy URL', () => {
      const proxy = createProxy();
      expect(proxy.getProxyUrl('aap-mcp')).toBe(
        'http://localhost:7007/api/agentic-chat/mcp-proxy/aap-mcp',
      );
    });

    it('strips trailing slash from base URL', () => {
      const proxy = new McpProxyService({
        logger: mockLogger,
        mcpAuth: {
          getServerHeaders: jest.fn(),
        } as unknown as import('./McpAuthService').McpAuthService,
        skipTlsVerify: false,
        proxyBaseUrl: 'http://localhost:7007/api/agentic-chat/',
      });
      expect(proxy.getProxyUrl('ocp-mcp')).toBe(
        'http://localhost:7007/api/agentic-chat/mcp-proxy/ocp-mcp',
      );
    });
  });

  describe('updateProxyBaseUrl', () => {
    it('updates the base URL used by getProxyUrl', () => {
      const proxy = createProxy();
      proxy.updateProxyBaseUrl('https://tunnel.example.com/api/agentic-chat');
      expect(proxy.getProxyUrl('ocp-mcp')).toBe(
        'https://tunnel.example.com/api/agentic-chat/mcp-proxy/ocp-mcp',
      );
    });

    it('strips trailing slash from the new URL', () => {
      const proxy = createProxy();
      proxy.updateProxyBaseUrl('https://tunnel.example.com/api/agentic-chat/');
      expect(proxy.getProxyUrl('ocp-mcp')).toBe(
        'https://tunnel.example.com/api/agentic-chat/mcp-proxy/ocp-mcp',
      );
    });

    it('reverts to original URL when called with original value', () => {
      const proxy = createProxy();
      proxy.updateProxyBaseUrl('https://tunnel.example.com/api/agentic-chat');
      proxy.updateProxyBaseUrl('http://localhost:7007/api/agentic-chat');
      expect(proxy.getProxyUrl('ocp-mcp')).toBe(
        'http://localhost:7007/api/agentic-chat/mcp-proxy/ocp-mcp',
      );
    });
  });

  describe('handleRequest', () => {
    let proxy: McpProxyService;

    beforeEach(() => {
      proxy = createProxy();
      registerServers(proxy);
    });

    it('returns 404 for unknown server', async () => {
      const result = await proxy.handleRequest(
        'unknown-server',
        JSON.stringify({ jsonrpc: '2.0', method: 'initialize', id: 1 }),
        {},
      );
      expect(result.status).toBe(404);
      const body = JSON.parse(result.body);
      expect(body.error.message).toContain('Unknown MCP server');
    });

    it('returns 400 for invalid JSON', async () => {
      const result = await proxy.handleRequest('aap-mcp', 'not valid json', {});
      expect(result.status).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.message).toBe('Parse error');
    });

    it('rejects JSON-RPC batch requests', async () => {
      const result = await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify([
          { jsonrpc: '2.0', method: 'tools/list', id: 1 },
          { jsonrpc: '2.0', method: 'tools/list', id: 2 },
        ]),
        {},
      );
      expect(result.status).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(-32600);
      expect(body.error.message).toContain('batch');
    });

    it('rejects invalid serverId format', async () => {
      const result = await proxy.handleRequest(
        '../../../etc/passwd',
        JSON.stringify({ jsonrpc: '2.0', method: 'initialize', id: 1 }),
        {},
      );
      expect(result.status).toBe(400);
      expect(JSON.parse(result.body).error.message).toContain(
        'Invalid server ID',
      );
    });

    // ---- tools/list prefixing ----

    it('prefixes tool names in tools/list response', async () => {
      const upstreamResponse = {
        jsonrpc: '2.0',
        result: {
          tools: [
            { name: 'projects_list', description: 'List projects' },
            { name: 'pods_list', description: 'List pods' },
          ],
        },
        id: 1,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {},
        text: () => Promise.resolve(JSON.stringify(upstreamResponse)),
        json: () => Promise.resolve(upstreamResponse),
      });
      mockParseJsonRpc.mockReturnValue(
        JSON.parse(JSON.stringify(upstreamResponse)),
      );

      const result = await proxy.handleRequest(
        'ocp-mcp',
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: 1,
        }),
        {},
      );

      expect(result.status).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.result.tools[0].name).toBe('ocp_mcp__projects_list');
      expect(body.result.tools[0].description).toBe('[ocp-mcp] List projects');
      expect(body.result.tools[1].name).toBe('ocp_mcp__pods_list');
    });

    it('handles empty tools list', async () => {
      const upstreamResponse = { jsonrpc: '2.0', result: { tools: [] }, id: 1 };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {},
        text: () => Promise.resolve(JSON.stringify(upstreamResponse)),
        json: () => Promise.resolve(upstreamResponse),
      });
      mockParseJsonRpc.mockReturnValue(
        JSON.parse(JSON.stringify(upstreamResponse)),
      );

      const result = await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: 1,
        }),
        {},
      );

      expect(result.status).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.result.tools).toEqual([]);
    });

    // ---- tools/call prefix stripping ----

    it('strips prefix from tools/call request and forwards', async () => {
      const upstreamResponse = {
        jsonrpc: '2.0',
        result: { content: [{ type: 'text', text: 'success' }] },
        id: 2,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {},
        text: () => Promise.resolve(JSON.stringify(upstreamResponse)),
        json: () => Promise.resolve(upstreamResponse),
      });
      mockParseJsonRpc.mockReturnValue(upstreamResponse);

      await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: { name: 'aap_mcp__projects_list', arguments: {} },
          id: 2,
        }),
        {},
      );

      const forwardedBody = JSON.parse(mockFetch.mock.calls[0][1]!.body!);
      expect(forwardedBody.params.name).toBe('projects_list');
    });

    it('preserves tool name if prefix does not match', async () => {
      const upstreamResponse = { jsonrpc: '2.0', result: {}, id: 2 };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {},
        text: () => Promise.resolve(JSON.stringify(upstreamResponse)),
        json: () => Promise.resolve(upstreamResponse),
      });
      mockParseJsonRpc.mockReturnValue(upstreamResponse);

      await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: { name: 'unknown_tool', arguments: {} },
          id: 2,
        }),
        {},
      );

      const forwardedBody = JSON.parse(mockFetch.mock.calls[0][1]!.body!);
      expect(forwardedBody.params.name).toBe('unknown_tool');
    });

    // ---- pass-through ----

    it('forwards non-tool methods unchanged', async () => {
      const upstreamResponse = {
        jsonrpc: '2.0',
        result: { protocolVersion: '2025-03-26', capabilities: {} },
        id: 1,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {},
        text: () => Promise.resolve(JSON.stringify(upstreamResponse)),
        json: () => Promise.resolve(upstreamResponse),
      });
      mockParseJsonRpc.mockReturnValue(upstreamResponse);

      const result = await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {},
          id: 1,
        }),
        {},
      );

      expect(result.status).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.result.protocolVersion).toBe('2025-03-26');
    });

    // ---- upstream failure ----

    it('returns 502 when upstream server is unreachable', async () => {
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
        {},
      );

      expect(result.status).toBe(502);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(-32603);
      expect(body.error.message).toContain('failed to reach MCP server');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('failed to forward'),
      );
    });

    it('returns 502 when upstream response is too large', async () => {
      const largeBody = 'x'.repeat(11 * 1024 * 1024);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {},
        text: () => Promise.resolve(largeBody),
        json: () => Promise.resolve(null),
      });

      const result = await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
        {},
      );

      expect(result.status).toBe(502);
      expect(JSON.parse(result.body).error.message).toContain(
        'exceeds size limit',
      );
    });

    // ---- SSRF protection ----

    it('blocks requests to private URLs', async () => {
      mockIsPrivateUrl.mockReturnValue('link-local');

      const result = await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
        {},
      );

      expect(result.status).toBe(403);
      expect(JSON.parse(result.body).error.message).toContain('blocked');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    // ---- session mapping ----

    it('creates proxy session when upstream returns session ID', async () => {
      const upstreamResponse = { jsonrpc: '2.0', result: {}, id: 1 };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { 'mcp-session-id': 'real-session-abc' },
        text: () => Promise.resolve(JSON.stringify(upstreamResponse)),
        json: () => Promise.resolve(upstreamResponse),
      });
      mockParseJsonRpc.mockReturnValue(upstreamResponse);

      const result = await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({ jsonrpc: '2.0', method: 'initialize', id: 1 }),
        {},
      );

      expect(result.status).toBe(200);
      expect(result.headers['Mcp-Session-Id']).toMatch(/^proxy-aap-mcp-/);
    });

    it('maps proxy session ID to real session ID on subsequent requests', async () => {
      const upstreamResponse = { jsonrpc: '2.0', result: {}, id: 1 };

      // First request: upstream returns a session ID
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { 'mcp-session-id': 'real-session-abc' },
        text: () => Promise.resolve(JSON.stringify(upstreamResponse)),
        json: () => Promise.resolve(upstreamResponse),
      });
      mockParseJsonRpc.mockReturnValue(upstreamResponse);

      const firstResult = await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({ jsonrpc: '2.0', method: 'initialize', id: 1 }),
        {},
      );
      const proxySessionId = firstResult.headers['Mcp-Session-Id'];

      // Second request: use the proxy session ID
      mockFetch.mockClear();
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {},
        text: () => Promise.resolve(JSON.stringify(upstreamResponse)),
        json: () => Promise.resolve(upstreamResponse),
      });

      await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 2 }),
        { 'mcp-session-id': proxySessionId },
      );

      const forwardedHeaders = mockFetch.mock.calls[0][1]!.headers as Record<
        string,
        string
      >;
      expect(forwardedHeaders['Mcp-Session-Id']).toBe('real-session-abc');
    });

    // ---- upstream malformed response ----

    it('returns raw body when upstream response is not valid JSON-RPC', async () => {
      const rawHtml = '<html>Server Error</html>';
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        headers: {},
        text: () => Promise.resolve(rawHtml),
        json: () => Promise.reject(new Error('not json')),
      });
      mockParseJsonRpc.mockReturnValue(null);

      const result = await proxy.handleRequest(
        'aap-mcp',
        JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
        {},
      );

      expect(result.status).toBe(500);
      expect(result.body).toBe(rawHtml);
    });
  });

  describe('dispose', () => {
    it('clears the cleanup timer', () => {
      const proxy = createProxy();
      proxy.dispose();
      // No error on double-dispose
      proxy.dispose();
    });
  });
});
