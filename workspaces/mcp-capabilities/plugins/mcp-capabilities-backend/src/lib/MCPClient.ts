/*
 * Copyright 2026 The Backstage Authors
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
import { LoggerService } from '@backstage/backend-plugin-api';
import { JsonObject } from '@backstage/types';
import {
  MCPToolAnnotations,
  MCPToolInfo,
  MCPResourceInfo,
  MCPPromptInfo,
  MCPServerSpec,
} from '@backstage-community/plugin-mcp-capabilities-common';

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: Record<string, unknown>;
  error?: { code: number; message: string; data?: unknown };
}

export interface MCPClientConfig {
  url: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * A minimal MCP client over the streamable-http transport. Performs the
 * handshake (`initialize` -> `notifications/initialized`) and then a
 * capability-gated discovery of tools, resources, and prompts.
 *
 * Accepts both `application/json` and `text/event-stream` responses, since MCP
 * servers may reply with either.
 */
export class MCPClient {
  private readonly config: MCPClientConfig;
  private readonly logger: LoggerService;
  private requestId = 0;
  private sessionId?: string;

  constructor(config: MCPClientConfig, logger: LoggerService) {
    this.config = config;
    this.logger = logger;
  }

  async discover(): Promise<MCPServerSpec> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs ?? 30_000,
    );

    try {
      const initResponse = await this.sendJsonRpc(
        'initialize',
        {
          protocolVersion: '2025-06-18',
          capabilities: {},
          clientInfo: { name: 'backstage-mcp-capabilities', version: '1.0.0' },
        },
        controller.signal,
      );

      if (initResponse.error) {
        throw new Error(`initialize failed: ${initResponse.error.message}`);
      }

      const result = initResponse.result ?? {};
      const serverInfo = result.serverInfo as MCPServerSpec['serverInfo'];
      const protocolVersion = result.protocolVersion as string | undefined;
      const rawCapabilities =
        (result.capabilities as Record<string, unknown> | undefined) ?? {};
      const instructions = result.instructions as string | undefined;

      await this.sendNotification('notifications/initialized');

      const capabilities = {
        tools: Boolean(rawCapabilities.tools),
        resources: Boolean(rawCapabilities.resources),
        prompts: Boolean(rawCapabilities.prompts),
      };

      const tools = capabilities.tools
        ? await this.fetchTools(controller.signal)
        : [];
      const resources = capabilities.resources
        ? await this.fetchResources(controller.signal)
        : [];
      const prompts = capabilities.prompts
        ? await this.fetchPrompts(controller.signal)
        : [];

      return {
        serverInfo,
        protocolVersion,
        capabilities,
        instructions,
        tools,
        resources,
        prompts,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private async fetchTools(signal: AbortSignal): Promise<MCPToolInfo[]> {
    const response = await this.sendJsonRpc('tools/list', {}, signal);
    if (response.error) {
      this.logger.debug(`tools/list error: ${response.error.message}`);
      return [];
    }
    const tools =
      (response.result?.tools as Array<Record<string, unknown>>) ?? [];
    return tools.map(t => ({
      name: t.name as string,
      description: t.description as string | undefined,
      inputSchema: (t.inputSchema as JsonObject) ?? {},
      outputSchema: t.outputSchema as JsonObject | undefined,
      annotations: t.annotations as MCPToolAnnotations | undefined,
    }));
  }

  private async fetchResources(
    signal: AbortSignal,
  ): Promise<MCPResourceInfo[]> {
    const response = await this.sendJsonRpc('resources/list', {}, signal);
    if (response.error) {
      this.logger.debug(`resources/list error: ${response.error.message}`);
      return [];
    }
    const resources =
      (response.result?.resources as Array<Record<string, unknown>>) ?? [];
    return resources.map(r => ({
      uri: r.uri as string,
      name: r.name as string,
      title: r.title as string | undefined,
      description: r.description as string | undefined,
      mimeType: r.mimeType as string | undefined,
      size: r.size as number | undefined,
    }));
  }

  private async fetchPrompts(signal: AbortSignal): Promise<MCPPromptInfo[]> {
    const response = await this.sendJsonRpc('prompts/list', {}, signal);
    if (response.error) {
      this.logger.debug(`prompts/list error: ${response.error.message}`);
      return [];
    }
    const prompts =
      (response.result?.prompts as Array<Record<string, unknown>>) ?? [];
    return prompts.map(p => ({
      name: p.name as string,
      title: p.title as string | undefined,
      description: p.description as string | undefined,
      arguments: p.arguments as MCPPromptInfo['arguments'],
    }));
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...(this.config.headers ?? {}),
    };
    if (this.sessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }
    return headers;
  }

  private async sendJsonRpc(
    method: string,
    params: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<JsonRpcResponse> {
    const id = ++this.requestId;
    const response = await fetch(this.config.url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
      signal,
    });

    const sessionId = response.headers.get('mcp-session-id');
    if (sessionId) {
      this.sessionId = sessionId;
    }

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} from ${this.config.url}: ${response.statusText}`,
      );
    }

    return this.parseResponse(response);
  }

  /** Parses either a plain JSON body or a `text/event-stream` (SSE) body. */
  private async parseResponse(response: Response): Promise<JsonRpcResponse> {
    const contentType = response.headers.get('content-type') ?? '';
    const text = await response.text();
    if (contentType.includes('text/event-stream')) {
      // Take the last `data:` payload that parses as a JSON-RPC message.
      const dataLines = text
        .split('\n')
        .filter(line => line.startsWith('data:'))
        .map(line => line.slice('data:'.length).trim());
      for (const line of dataLines.reverse()) {
        try {
          return JSON.parse(line) as JsonRpcResponse;
        } catch {
          // keep looking
        }
      }
      throw new Error('No JSON-RPC payload found in event-stream response');
    }
    return JSON.parse(text) as JsonRpcResponse;
  }

  private async sendNotification(method: string): Promise<void> {
    try {
      await fetch(this.config.url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ jsonrpc: '2.0', method, params: {} }),
      });
    } catch {
      // Notifications are fire-and-forget.
    }
  }
}
