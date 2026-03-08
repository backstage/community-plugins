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
import * as http from 'http';
import * as https from 'https';
import FormDataNode from 'form-data';
import { LlamaStackConfig } from '../../types';
import {
  API_REQUEST_TIMEOUT_MS,
  STREAM_REQUEST_TIMEOUT_MS,
} from '../../constants';
import { toErrorMessage } from '../../services/utils';

/**
 * Request options for Llama Stack API calls
 */
export interface LlamaStackRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

/**
 * HTTP client for Llama Stack API
 *
 * Handles all HTTP communication with Llama Stack including:
 * - Standard JSON requests
 * - FormData uploads (multipart/form-data)
 * - Streaming SSE responses
 * - TLS certificate verification (configurable)
 */
export class LlamaStackClient {
  private readonly config: LlamaStackConfig;
  private readonly agent: http.Agent | https.Agent;

  constructor(config: LlamaStackConfig) {
    this.config = config;
    const isHttps = config.baseUrl.startsWith('https');
    this.agent = isHttps
      ? new https.Agent({
          keepAlive: true,
          maxSockets: 10,
          rejectUnauthorized: !config.skipTlsVerify,
        })
      : new http.Agent({ keepAlive: true, maxSockets: 10 });
  }

  /**
   * Get the current configuration
   */
  getConfig(): LlamaStackConfig {
    return this.config;
  }

  /**
   * Make an API request to Llama Stack using https module
   * Handles self-signed/untrusted certificates common in enterprise environments
   */
  async request<T>(
    endpoint: string,
    options: LlamaStackRequestOptions = {},
  ): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers || {}),
    };

    if (this.config.token) {
      headers.Authorization = `Bearer ${this.config.token}`;
    }

    // Check if body is FormDataNode (for file uploads)
    const isFormData = options.body instanceof FormDataNode;

    // Only set Content-Type for requests with a body (POST, PUT, PATCH)
    // For FormData, the form-data package will set the correct Content-Type with boundary
    if (options.body && !isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return new Promise<T>((resolve, reject) => {
      // TypeScript narrows options.body to FormDataNode when isFormData is true (instanceof check above)
      const formDataBody: FormDataNode | null = isFormData
        ? (options.body as FormDataNode)
        : null;

      const isHttps = url.protocol === 'https:';
      const reqOptions: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: formDataBody
          ? { ...headers, ...formDataBody.getHeaders() }
          : headers,
        agent: this.agent,
      };

      const transport = isHttps ? https : http;
      const req = transport.request(reqOptions, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data) as T);
            } catch {
              reject(
                new Error(
                  `Failed to parse response: ${data.substring(0, 200)}`,
                ),
              );
            }
          } else {
            reject(
              new Error(
                `Llama Stack API error: ${res.statusCode} ${res.statusMessage} - ${data}`,
              ),
            );
          }
        });
      });

      req.setTimeout(API_REQUEST_TIMEOUT_MS, () => {
        req.destroy();
        reject(
          new Error(
            `Llama Stack API request timed out after ${
              API_REQUEST_TIMEOUT_MS / 1000
            } seconds`,
          ),
        );
      });

      req.on('error', e => {
        reject(new Error(`Llama Stack connection error: ${e.message}`));
      });

      // Handle body - FormData needs special streaming, others use string
      if (options.body) {
        if (formDataBody) {
          // Stream FormData to the request (handles multipart/form-data properly)
          formDataBody.pipe(req);
        } else {
          const bodyStr =
            typeof options.body === 'string'
              ? options.body
              : JSON.stringify(options.body);
          req.write(bodyStr);
          req.end();
        }
      } else {
        req.end();
      }
    });
  }

  /**
   * Make a streaming request to Llama Stack (for SSE responses)
   * Uses https module for consistent TLS verification with skipTlsVerify config
   *
   * @param endpoint - API endpoint path
   * @param body - Request body (will be JSON serialized)
   * @param onData - Callback for each SSE data event
   */
  async streamRequest(
    endpoint: string,
    body: unknown,
    onData: (data: string) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    };

    if (this.config.token) {
      headers.Authorization = `Bearer ${this.config.token}`;
    }

    const bodyStr = JSON.stringify(body);

    return new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new Error('Stream aborted before request started'));
        return;
      }

      const isHttps = url.protocol === 'https:';
      const reqOptions: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(bodyStr),
        },
        agent: this.agent,
      };

      const transport = isHttps ? https : http;
      const req = transport.request(reqOptions, res => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          let errorData = '';
          res.on('data', chunk => {
            errorData += chunk;
          });
          res.on('end', () => {
            reject(
              new Error(
                `Streaming request failed: ${res.statusCode} ${errorData}`,
              ),
            );
          });
          return;
        }

        let buffer = '';

        res.on('data', (chunk: Buffer) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data && data !== '[DONE]') {
                onData(data);
              }
            }
          }
        });

        res.on('end', () => {
          if (buffer.startsWith('data: ')) {
            const data = buffer.slice(6).trim();
            if (data && data !== '[DONE]') {
              onData(data);
            }
          }
          resolve();
        });

        res.on('error', e => {
          reject(new Error(`Streaming response error: ${e.message}`));
        });
      });

      if (signal) {
        const onAbort = () => {
          req.destroy();
          reject(new Error('Stream aborted by client'));
        };
        signal.addEventListener('abort', onAbort, { once: true });
        req.on('close', () => signal.removeEventListener('abort', onAbort));
      }

      req.setTimeout(STREAM_REQUEST_TIMEOUT_MS, () => {
        req.destroy();
        reject(
          new Error(
            `Streaming request timed out after ${
              STREAM_REQUEST_TIMEOUT_MS / 1000
            } seconds`,
          ),
        );
      });

      req.on('error', e => {
        reject(
          new Error(`Llama Stack streaming connection error: ${e.message}`),
        );
      });

      req.write(bodyStr);
      req.end();
    });
  }

  /**
   * Test connection to Llama Stack by making a simple request
   */
  async testConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      // Try to list models as a simple connectivity check
      await this.request<{ data: unknown[] }>('/v1/openai/v1/models', {
        method: 'GET',
      });
      return { connected: true };
    } catch (error) {
      return {
        connected: false,
        error: toErrorMessage(error),
      };
    }
  }
}
