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
import https from 'https';
import type { LoggerService } from '@backstage/backend-plugin-api';
import { MCP_CONNECTION_TIMEOUT_MS } from '../constants';
import { parseJsonRpcFromResponse } from './utils/http';

const BLOCKED_HEADERS = new Set([
  'host',
  'content-type',
  'content-length',
  'accept',
  'transfer-encoding',
  'connection',
  'cookie',
]);

export interface McpTestResult {
  success: boolean;
  warning?: string;
  error?: string;
  serverType: string;
  tools: Array<{ name: string; description?: string }>;
  toolCount: number;
}

/**
 * Detects whether a hostname refers to a private/internal network address.
 * Prevents SSRF by blocking localhost, loopback, and RFC-1918 ranges.
 */
export function isPrivateHost(hostname: string): boolean {
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname === '0.0.0.0'
  ) {
    return true;
  }
  const parts = hostname.split('.');
  if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
    const octets = parts.map(Number);
    if (octets[0] === 10) return true;
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    if (octets[0] === 192 && octets[1] === 168) return true;
    if (octets[0] === 169 && octets[1] === 254) return true;
  }
  return false;
}

/**
 * Orchestrates MCP server test connections: initialize → notifications/initialized → tools/list.
 * Extracted from adminRoutes.ts to separate transport concerns from route handling.
 */
export class McpTestService {
  private sessionId: string | undefined;

  constructor(
    private readonly skipTls: boolean,
    private readonly logger: LoggerService,
  ) {}

  async testConnection(
    url: string,
    type?: string,
    headers?: Record<string, string>,
  ): Promise<McpTestResult> {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return {
        success: false,
        error: 'URL must start with http:// or https://',
        serverType: type || 'streamable-http',
        tools: [],
        toolCount: 0,
      };
    }

    if (isPrivateHost(parsedUrl.hostname)) {
      return {
        success: false,
        error:
          'URLs pointing to private/internal network addresses are not allowed',
        serverType: type || 'streamable-http',
        tools: [],
        toolCount: 0,
      };
    }

    this.sessionId = undefined;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      MCP_CONNECTION_TIMEOUT_MS,
    );

    try {
      const initResponse = await this.postJsonRpc(
        url,
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'agentic-chat-test', version: '1.0.0' },
          },
          id: 1,
        }),
        controller.signal,
        headers,
      );
      if (!initResponse.ok) {
        return {
          success: false,
          error: `MCP server returned HTTP ${initResponse.status}`,
          serverType: type || 'streamable-http',
          tools: [],
          toolCount: 0,
        };
      }

      const notifResponse = await this.postJsonRpc(
        url,
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized',
        }),
        controller.signal,
        headers,
      );

      const toolsResponse = await this.postJsonRpc(
        url,
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: 2,
        }),
        controller.signal,
        headers,
      );

      let tools: Array<{ name: string; description?: string }> = [];
      let warning: string | undefined;

      if (toolsResponse.ok) {
        const toolsJson = (await toolsResponse.json()) as {
          result?: { tools?: Array<{ name: string; description?: string }> };
          error?: { message?: string };
        };
        if (toolsJson?.error) {
          warning = `tools/list returned error: ${
            toolsJson.error.message || 'unknown'
          }`;
        } else {
          tools = toolsJson?.result?.tools ?? [];
        }
      } else {
        const sessionLost = !notifResponse.ok;
        if (sessionLost) {
          warning =
            'Server accepted initialize but session was lost. ' +
            'This usually means the server requires authentication (Bearer token).';
        } else {
          warning = `tools/list failed with HTTP ${toolsResponse.status}`;
        }
      }

      await this.cleanupSession(url);

      return {
        success: true,
        ...(warning ? { warning } : {}),
        serverType: type || 'streamable-http',
        tools: tools.map(t => ({ name: t.name, description: t.description })),
        toolCount: tools.length,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async postJsonRpc(
    targetUrl: string,
    body: string,
    signal: AbortSignal,
    extraHeaders?: Record<string, string>,
  ): Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }> {
    const parsed = new URL(targetUrl);
    const hdrs: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };
    if (extraHeaders) {
      for (const [key, value] of Object.entries(extraHeaders)) {
        if (
          typeof value === 'string' &&
          !BLOCKED_HEADERS.has(key.toLowerCase())
        ) {
          hdrs[key] = value;
        }
      }
    }
    if (this.sessionId) {
      hdrs['Mcp-Session-Id'] = this.sessionId;
    }

    if (parsed.protocol === 'http:' || !this.skipTls) {
      const r = await fetch(targetUrl, {
        method: 'POST',
        headers: hdrs,
        body,
        signal,
      });
      const sid = r.headers.get('mcp-session-id');
      if (sid) this.sessionId = sid;
      const rawText = await r.text();
      return {
        ok: r.ok,
        status: r.status,
        json: () => Promise.resolve(parseJsonRpcFromResponse(rawText)),
      };
    }

    return new Promise((resolve, reject) => {
      const opts: https.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: hdrs,
        rejectUnauthorized: false,
      };
      const httpReq = https.request(opts, httpRes => {
        const sid = httpRes.headers['mcp-session-id'] as string | undefined;
        if (sid) this.sessionId = sid;
        const chunks: Buffer[] = [];
        httpReq.on('data', (c: Buffer) => chunks.push(c));
        httpRes.on('data', (c: Buffer) => chunks.push(c));
        httpRes.on('end', () => {
          const raw = Buffer.concat(chunks).toString();
          resolve({
            ok:
              (httpRes.statusCode ?? 0) >= 200 &&
              (httpRes.statusCode ?? 0) < 300,
            status: httpRes.statusCode ?? 0,
            json: () => Promise.resolve(parseJsonRpcFromResponse(raw)),
          });
        });
      });
      httpReq.setTimeout(MCP_CONNECTION_TIMEOUT_MS, () => {
        httpReq.destroy(new Error('HTTPS request timed out'));
      });
      httpReq.on('error', reject);
      signal.addEventListener('abort', () => httpReq.destroy());
      httpReq.write(body);
      httpReq.end();
    });
  }

  private async cleanupSession(url: string): Promise<void> {
    if (!this.sessionId) return;
    try {
      const parsed = new URL(url);
      const hdrs: Record<string, string> = {
        'Mcp-Session-Id': this.sessionId,
      };
      if (parsed.protocol === 'http:' || !this.skipTls) {
        await fetch(url, {
          method: 'DELETE',
          headers: hdrs,
          signal: AbortSignal.timeout(10_000),
        }).catch(err => {
          this.logger.debug('Best-effort disconnect cleanup failed', {
            error: String(err),
          });
        });
      } else {
        const opts: https.RequestOptions = {
          hostname: parsed.hostname,
          port: parsed.port || 443,
          path: parsed.pathname + parsed.search,
          method: 'DELETE',
          headers: hdrs,
          rejectUnauthorized: false,
        };
        const httpReq = https.request(opts);
        httpReq.on('error', err => {
          this.logger.debug('HTTPS disconnect request error during cleanup', {
            error: String(err),
          });
        });
        httpReq.end();
      }
    } catch (err) {
      this.logger.debug('Best-effort session cleanup failed', {
        error: String(err),
      });
    }
  }
}
