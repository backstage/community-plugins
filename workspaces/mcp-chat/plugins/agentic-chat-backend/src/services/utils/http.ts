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
import { DEFAULT_HTTP_TIMEOUT_MS } from '../../constants';
import * as https from 'https';
import * as http from 'http';

/**
 * Extracts a JSON-RPC response from raw text that may be either plain JSON
 * or Server-Sent Events (SSE) format.
 *
 * MCP streamable-http servers can respond with either content-type:
 *   - application/json  → body is `{"jsonrpc":"2.0",...}`
 *   - text/event-stream → body is `event: message\ndata: {"jsonrpc":"2.0",...}\n\n`
 *
 * Returns the parsed object, or null if no valid JSON could be extracted.
 */
export function parseJsonRpcFromResponse(raw: string): unknown | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Response body may not be JSON; try next parser
    }
  }

  // SSE format: extract `data:` lines between event boundaries (blank lines)
  const lines = trimmed.split('\n');
  let dataChunks: string[] = [];

  for (const line of lines) {
    if (line.startsWith('data:')) {
      dataChunks.push(line.slice(5).trim());
    } else if (line.trim() === '' && dataChunks.length > 0) {
      // End of SSE event — try to parse accumulated data
      const payload = dataChunks.join('\n');
      dataChunks = [];
      try {
        return JSON.parse(payload);
      } catch {
        // Response body may not be JSON; try next parser
      }
    }
  }

  // Handle case where stream ends without trailing blank line
  if (dataChunks.length > 0) {
    try {
      return JSON.parse(dataChunks.join('\n'));
    } catch {
      // Response body may not be JSON; try next parser
    }
  }

  return null;
}

/**
 * Response-like interface returned by fetchWithTlsControl.
 * Compatible with both GET (DocumentIngestionService) and POST (McpAuthService) patterns.
 */
export interface TlsResponse {
  ok: boolean;
  status: number;
  headers?: Record<string, string>;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
}

export interface FetchWithTlsControlOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  skipTlsVerify?: boolean;
  timeoutMs?: number;
}

/**
 * Shared TLS-aware HTTP(S) fetch that returns a Response-like object.
 * Consolidates the identical `fetchWithTlsControl` implementations
 * previously duplicated across DocumentIngestionService, McpAuthService,
 * and StatusService.
 *
 * When TLS verification is enabled (or the URL is HTTP), delegates to native `fetch`.
 * When TLS verification is skipped AND the URL is HTTPS, uses `https.request`
 * with `rejectUnauthorized: false`.
 */
export function fetchWithTlsControl(
  url: string,
  options: FetchWithTlsControlOptions = {},
): Promise<TlsResponse> {
  const {
    method = 'GET',
    headers = {},
    body,
    skipTlsVerify = false,
    timeoutMs = DEFAULT_HTTP_TIMEOUT_MS,
  } = options;

  const parsedUrl = new URL(url);

  if (parsedUrl.protocol === 'http:' || !skipTlsVerify) {
    const init: RequestInit = { method, headers };
    if (body) init.body = body;
    if (timeoutMs !== null && timeoutMs !== undefined && timeoutMs > 0) {
      init.signal = AbortSignal.timeout(timeoutMs);
    }
    return fetch(url, init).then(r => {
      const responseHeaders: Record<string, string> = {};
      if (r.headers && typeof r.headers.forEach === 'function') {
        r.headers.forEach((v, k) => {
          responseHeaders[k] = v;
        });
      }
      return {
        ok: r.ok,
        status: r.status,
        headers: responseHeaders,
        text: () => r.text(),
        json: () => r.json() as Promise<unknown>,
      };
    });
  }

  return new Promise((resolve, reject) => {
    const reqOptions: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers,
      rejectUnauthorized: false,
    };

    const req = https.request(reqOptions, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        const responseHeaders: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.headers)) {
          if (typeof v === 'string') responseHeaders[k] = v;
        }
        resolve({
          ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
          status: res.statusCode ?? 0,
          headers: responseHeaders,
          text: async () => data,
          json: async () => JSON.parse(data),
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    if (body) req.write(body);
    req.end();
  });
}

interface TlsFetchOptions {
  url: URL;
  method: string;
  headers: Record<string, string>;
  body?: string;
  skipTlsVerify?: boolean;
  timeoutMs?: number;
  /** Label used in error messages, e.g. 'Safety API' */
  label?: string;
}

/**
 * Shared TLS-aware HTTP(S) request utility.
 *
 * Consolidates the identical https.request patterns used across
 * SafetyService, EvaluationService, McpAuthService, LlamaStackOrchestrator,
 * and DocumentIngestionService.
 */
export function tlsFetch<T>(opts: TlsFetchOptions): Promise<T> {
  const {
    url,
    method,
    headers,
    body,
    skipTlsVerify = false,
    timeoutMs = DEFAULT_HTTP_TIMEOUT_MS,
    label = 'HTTP',
  } = opts;

  const isHttps = url.protocol === 'https:';

  return new Promise<T>((resolve, reject) => {
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
      ...(isHttps ? { rejectUnauthorized: !skipTlsVerify } : {}),
    };

    const transport = isHttps ? https : http;

    const done = <V>(
      settle: (v: V) => void,
      value: V,
      timer: ReturnType<typeof setTimeout>,
    ) => {
      clearTimeout(timer);
      settle(value);
    };

    // eslint-disable-next-line prefer-const
    let timeoutHandle: ReturnType<typeof setTimeout>;

    const req = transport.request(reqOptions, res => {
      let data = '';
      res.on('data', (chunk: string) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            done(resolve, JSON.parse(data) as T, timeoutHandle);
          } catch {
            done(
              reject,
              new Error(
                `${label}: failed to parse response: ${data.substring(0, 200)}`,
              ),
              timeoutHandle,
            );
          }
        } else {
          done(
            reject,
            new Error(`${label}: HTTP ${res.statusCode} ${res.statusMessage}`),
            timeoutHandle,
          );
        }
      });
    });

    timeoutHandle = setTimeout(() => {
      req.destroy();
      reject(new Error(`${label}: request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    req.on('error', (e: Error) =>
      done(
        reject,
        new Error(`${label}: connection error: ${e.message}`),
        timeoutHandle,
      ),
    );

    if (body) {
      req.write(body);
    }
    req.end();
  });
}
