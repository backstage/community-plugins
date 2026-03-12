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
import type { MCPServerConfig } from '../../types';
import type { McpAuthService } from './McpAuthService';
import {
  fetchWithTlsControl,
  parseJsonRpcFromResponse,
} from '../../services/utils/http';
import { isPrivateUrl } from '../../services/utils/SsrfGuard';
import { MCP_TOOLS_TIMEOUT_MS } from '../../constants';

const MAX_RESPONSE_BYTES = 10 * 1024 * 1024; // 10 MB
const SERVER_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;

/**
 * Cached map of MCP server ID to the list of tool names discovered on that server.
 * Populated from StatusService health checks (which call MCP tools/list).
 */
export type McpToolsCache = Map<string, string[]>;

/**
 * Result of checking whether proxy mode is needed.
 */
export interface ProxyModeResult {
  /** Whether any tool name conflicts were detected across servers. */
  enabled: boolean;
  /** Tool names that appear on multiple servers. */
  conflictingTools: string[];
}

/**
 * JSON-RPC message shape used by the MCP protocol.
 */
interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id?: number | string;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
  id?: number | string | null;
}

/**
 * Result from the proxy's request handler.
 */
export interface ProxyResult {
  status: number;
  body: string;
  headers: Record<string, string>;
}

interface ProxySession {
  realSessionId?: string;
  serverUrl: string;
  createdAt: number;
}

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * MCP Namespacing Proxy Service
 *
 * Sits between LlamaStack and real MCP servers, transparently prefixing tool
 * names with the server ID so that LlamaStack sees globally unique names.
 *
 * - `tools/list` responses: each tool name is prefixed with `{serverId}__`
 * - `tools/call` requests: the prefix is stripped before forwarding
 * - All other JSON-RPC messages are forwarded unchanged
 *
 * This activates only when tool name conflicts are detected across servers,
 * adding zero overhead in the common case.
 */
export class McpProxyService {
  private readonly logger: LoggerService;
  private readonly mcpAuth: McpAuthService;
  private readonly skipTlsVerify: boolean;
  private proxyBaseUrl: string;

  private servers: Map<string, MCPServerConfig> = new Map();
  private sessions: Map<string, ProxySession> = new Map();
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(deps: {
    logger: LoggerService;
    mcpAuth: McpAuthService;
    skipTlsVerify: boolean;
    proxyBaseUrl: string;
  }) {
    this.logger = deps.logger;
    this.mcpAuth = deps.mcpAuth;
    this.skipTlsVerify = deps.skipTlsVerify;
    this.proxyBaseUrl = deps.proxyBaseUrl.replace(/\/$/, '');

    this.cleanupTimer = setInterval(
      () => this.cleanupSessions(),
      SESSION_CLEANUP_INTERVAL_MS,
    );
    if (
      this.cleanupTimer &&
      typeof this.cleanupTimer === 'object' &&
      'unref' in this.cleanupTimer
    ) {
      (this.cleanupTimer as NodeJS.Timeout).unref();
    }
  }

  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private cleanupSessions(): void {
    const now = Date.now();
    let cleaned = 0;
    for (const [id, session] of this.sessions) {
      if (now - session.createdAt > SESSION_TTL_MS) {
        this.sessions.delete(id);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      this.logger.info(
        `MCP proxy: cleaned up ${cleaned} expired sessions (${this.sessions.size} remaining)`,
      );
    }
  }

  /**
   * Handle a DELETE request for MCP session close.
   * Forwards the DELETE to the upstream server and cleans up proxy sessions.
   */
  async handleDelete(
    serverId: string,
    incomingHeaders: Record<string, string>,
  ): Promise<{ status: number }> {
    const proxySessionId = incomingHeaders['mcp-session-id'];
    if (proxySessionId) {
      const session = this.sessions.get(proxySessionId);
      if (session?.realSessionId) {
        const server = this.servers.get(serverId);
        if (server) {
          try {
            const headers: Record<string, string> = {
              'Mcp-Session-Id': session.realSessionId,
            };
            const authHeaders = await this.mcpAuth.getServerHeaders(server);
            Object.assign(headers, authHeaders);
            await fetchWithTlsControl(server.url, {
              method: 'DELETE',
              headers,
              skipTlsVerify: this.skipTlsVerify,
              timeoutMs: 5000,
            });
          } catch {
            this.logger.debug(
              `MCP proxy: failed to forward DELETE to ${serverId}`,
            );
          }
        }
      }
      this.sessions.delete(proxySessionId);
    }
    return { status: 200 };
  }

  /**
   * Register MCP servers that the proxy can forward requests to.
   * Call this whenever the effective server list changes.
   */
  updateServers(servers: MCPServerConfig[]): void {
    this.servers.clear();
    for (const server of servers) {
      this.servers.set(server.id, server);
    }
  }

  updateProxyBaseUrl(url: string): void {
    this.proxyBaseUrl = url.replace(/\/$/, '');
  }

  /**
   * Get the proxy URL for a specific server.
   * LlamaStack will connect to this URL instead of the real server URL.
   */
  getProxyUrl(serverId: string): string {
    return `${this.proxyBaseUrl}/mcp-proxy/${encodeURIComponent(serverId)}`;
  }

  /**
   * Convert a server ID into a tool name prefix.
   * Dashes are replaced with underscores for valid tool name syntax.
   */
  static getPrefix(serverId: string): string {
    return `${serverId.replace(/-/g, '_')}__`;
  }

  /**
   * Strip the server prefix from a tool name.
   * Returns the original tool name and the server ID it was prefixed with,
   * or undefined if no prefix matched.
   */
  static stripPrefix(
    prefixedName: string,
    serverId: string,
  ): string | undefined {
    const prefix = McpProxyService.getPrefix(serverId);
    if (prefixedName.startsWith(prefix)) {
      return prefixedName.slice(prefix.length);
    }
    return undefined;
  }

  /**
   * Detect whether tool name conflicts exist across MCP servers.
   * When conflicts are found, proxy mode should be enabled for ALL servers
   * to ensure consistent tool naming.
   */
  static detectConflicts(toolsCache: McpToolsCache): ProxyModeResult {
    const toolToServers = new Map<string, string[]>();

    for (const [serverId, tools] of toolsCache) {
      for (const toolName of tools) {
        const existing = toolToServers.get(toolName);
        if (existing) {
          existing.push(serverId);
        } else {
          toolToServers.set(toolName, [serverId]);
        }
      }
    }

    const conflictingTools: string[] = [];
    for (const [toolName, serverIds] of toolToServers) {
      if (serverIds.length > 1) {
        conflictingTools.push(toolName);
      }
    }

    return {
      enabled: conflictingTools.length > 0,
      conflictingTools,
    };
  }

  /**
   * Handle an incoming MCP JSON-RPC request for a specific server.
   * Prefixes tool names in responses and strips prefixes from requests.
   */
  async handleRequest(
    serverId: string,
    rawBody: string,
    incomingHeaders: Record<string, string>,
  ): Promise<ProxyResult> {
    if (!SERVER_ID_PATTERN.test(serverId)) {
      return {
        status: 400,
        body: JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32602, message: 'Invalid server ID format' },
          id: null,
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const server = this.servers.get(serverId);
    if (!server) {
      return {
        status: 404,
        body: JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Unknown MCP server: ${serverId}`,
          },
          id: null,
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return {
        status: 400,
        body: JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32700, message: 'Parse error' },
          id: null,
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (Array.isArray(parsed)) {
      return {
        status: 400,
        body: JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message:
              'JSON-RPC batch requests are not supported by the MCP proxy',
          },
          id: null,
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const request = parsed as JsonRpcRequest;
    const prefix = McpProxyService.getPrefix(serverId);

    if (request.method === 'tools/call' && request.params) {
      const name = request.params.name as string | undefined;
      if (name && name.startsWith(prefix)) {
        request.params.name = name.slice(prefix.length);
      }
    }

    const response = await this.forwardToServer(
      serverId,
      server,
      request,
      incomingHeaders,
    );

    if (request.method === 'tools/list' && response.parsedBody) {
      this.prefixToolNames(response.parsedBody, prefix, serverId);
    }

    return {
      status: response.status,
      body:
        response.parsedBody !== null &&
        response.parsedBody !== undefined &&
        typeof response.parsedBody === 'object'
          ? JSON.stringify(response.parsedBody)
          : response.rawBody,
      headers: response.headers,
    };
  }

  private prefixToolNames(
    body: unknown,
    prefix: string,
    serverId: string,
  ): void {
    if (!body || typeof body !== 'object') return;

    const obj = body as Record<string, unknown>;
    const result = obj.result as Record<string, unknown> | undefined;
    if (!result) return;

    const tools = result.tools;
    if (!Array.isArray(tools)) return;

    for (const tool of tools) {
      if (tool && typeof tool === 'object' && typeof tool.name === 'string') {
        tool.name = `${prefix}${tool.name}`;
        if (typeof tool.description === 'string') {
          tool.description = `[${serverId}] ${tool.description}`;
        }
      }
    }
  }

  private async forwardToServer(
    serverId: string,
    server: MCPServerConfig,
    request: JsonRpcRequest,
    incomingHeaders: Record<string, string>,
  ): Promise<{
    status: number;
    rawBody: string;
    parsedBody: unknown;
    headers: Record<string, string>;
  }> {
    const buildResult = await this.buildProxyRequest(
      serverId,
      server,
      request,
      incomingHeaders,
    );
    if (buildResult.errorResponse) {
      return buildResult.errorResponse;
    }

    try {
      const { response, rawBody } = await this.executeProxyRequest(
        server,
        request,
        buildResult.headers,
      );
      return this.transformProxyResponse(
        serverId,
        server,
        request,
        incomingHeaders,
        response,
        rawBody,
      );
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `MCP proxy [req=${request.id ?? 'n/a'}]: failed to forward ${
          request.method
        } to ${serverId}: ${errMsg}`,
      );
      const errorResponse: JsonRpcResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `Proxy error: failed to reach MCP server ${serverId}`,
        },
        id: request.id ?? null,
      };
      return {
        status: 502,
        rawBody: JSON.stringify(errorResponse),
        parsedBody: errorResponse,
        headers: { 'Content-Type': 'application/json' },
      };
    }
  }

  private async buildProxyRequest(
    _serverId: string,
    server: MCPServerConfig,
    request: JsonRpcRequest,
    incomingHeaders: Record<string, string>,
  ): Promise<
    | { headers: Record<string, string>; errorResponse?: undefined }
    | {
        errorResponse: {
          status: number;
          rawBody: string;
          parsedBody: unknown;
          headers: Record<string, string>;
        };
        headers?: undefined;
      }
  > {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };

    const ssrfReason = isPrivateUrl(server.url);
    if (ssrfReason) {
      this.logger.warn(
        `MCP proxy: blocked SSRF attempt to ${server.url} (${ssrfReason})`,
      );
      const errorResponse: JsonRpcResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: `MCP server URL is blocked: ${ssrfReason}`,
        },
        id: request.id ?? null,
      };
      return {
        errorResponse: {
          status: 403,
          rawBody: JSON.stringify(errorResponse),
          parsedBody: errorResponse,
          headers: { 'Content-Type': 'application/json' },
        },
      };
    }

    const authHeaders = await this.mcpAuth.getServerHeaders(server);
    Object.assign(headers, authHeaders);

    const proxySessionId = incomingHeaders['mcp-session-id'];
    if (proxySessionId) {
      const session = this.sessions.get(proxySessionId);
      if (session?.realSessionId) {
        headers['Mcp-Session-Id'] = session.realSessionId;
      }
    }

    return { headers };
  }

  private async executeProxyRequest(
    server: MCPServerConfig,
    request: JsonRpcRequest,
    headers: Record<string, string>,
  ): Promise<{
    response: Awaited<ReturnType<typeof fetchWithTlsControl>>;
    rawBody: string;
  }> {
    const response = await fetchWithTlsControl(server.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      skipTlsVerify: this.skipTlsVerify,
      timeoutMs: MCP_TOOLS_TIMEOUT_MS,
    });
    const rawBody = await response.text();
    return { response, rawBody };
  }

  private transformProxyResponse(
    serverId: string,
    server: MCPServerConfig,
    request: JsonRpcRequest,
    incomingHeaders: Record<string, string>,
    response: Awaited<ReturnType<typeof fetchWithTlsControl>>,
    rawBody: string,
  ): {
    status: number;
    rawBody: string;
    parsedBody: unknown;
    headers: Record<string, string>;
  } {
    if (rawBody.length > MAX_RESPONSE_BYTES) {
      this.logger.warn(
        `MCP proxy: response from ${serverId} exceeds ${MAX_RESPONSE_BYTES} bytes (${rawBody.length}), truncating`,
      );
      const errorResponse: JsonRpcResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `Response from MCP server ${serverId} exceeds size limit`,
        },
        id: request.id ?? null,
      };
      return {
        status: 502,
        rawBody: JSON.stringify(errorResponse),
        parsedBody: errorResponse,
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const proxySessionId = incomingHeaders['mcp-session-id'];
    if (response.headers) {
      const sessionId =
        response.headers['mcp-session-id'] ||
        response.headers['Mcp-Session-Id'];
      if (sessionId) {
        if (proxySessionId) {
          const session = this.sessions.get(proxySessionId);
          if (session) {
            session.realSessionId = sessionId;
          }
        } else {
          const newProxySessionId = `proxy-${serverId}-${Date.now()}`;
          this.sessions.set(newProxySessionId, {
            realSessionId: sessionId,
            serverUrl: server.url,
            createdAt: Date.now(),
          });
          responseHeaders['Mcp-Session-Id'] = newProxySessionId;
        }
      }
    }

    const parsedBody = parseJsonRpcFromResponse(rawBody);

    if (parsedBody === null && rawBody.length > 0) {
      this.logger.debug(
        `MCP proxy [req=${
          request.id ?? 'n/a'
        }]: upstream ${serverId} returned non-JSON-RPC response (${
          rawBody.length
        } bytes)`,
      );
    }

    return {
      status: response.status,
      rawBody,
      parsedBody,
      headers: responseHeaders,
    };
  }
}
