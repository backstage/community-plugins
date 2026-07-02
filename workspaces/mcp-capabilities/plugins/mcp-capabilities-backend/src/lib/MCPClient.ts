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
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { RequestOptions } from '@modelcontextprotocol/sdk/shared/protocol.js';
import {
  MCPToolAnnotations,
  MCPToolInfo,
  MCPResourceInfo,
  MCPPromptInfo,
  MCPServerSpec,
} from '@backstage-community/plugin-mcp-capabilities-common';

export interface MCPClientConfig {
  url: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * A thin MCP client over the streamable-http transport, built on the official
 * `@modelcontextprotocol/sdk`. `connect()` performs the
 * `initialize` -> `notifications/initialized` handshake and manages the session;
 * discovery is then capability-gated across tools, resources, and prompts.
 */
export class MCPClient {
  private readonly config: MCPClientConfig;
  private readonly logger: LoggerService;

  constructor(config: MCPClientConfig, logger: LoggerService) {
    this.config = config;
    this.logger = logger;
  }

  async discover(): Promise<MCPServerSpec> {
    const client = new Client({
      name: 'backstage-mcp-capabilities',
      version: '1.0.0',
    });
    const transport = new StreamableHTTPClientTransport(
      new URL(this.config.url),
      this.config.headers
        ? { requestInit: { headers: this.config.headers } }
        : undefined,
    );
    const options: RequestOptions = {
      timeout: this.config.timeoutMs ?? 30_000,
    };

    try {
      await client.connect(transport, options);

      const serverVersion = client.getServerVersion();
      const serverInfo: MCPServerSpec['serverInfo'] = serverVersion
        ? { name: serverVersion.name, version: serverVersion.version }
        : undefined;
      const instructions = client.getInstructions();
      const rawCapabilities = client.getServerCapabilities() ?? {};
      const capabilities = {
        tools: Boolean(rawCapabilities.tools),
        resources: Boolean(rawCapabilities.resources),
        prompts: Boolean(rawCapabilities.prompts),
      };

      const tools = capabilities.tools
        ? await this.fetchTools(client, options)
        : [];
      const resources = capabilities.resources
        ? await this.fetchResources(client, options)
        : [];
      const prompts = capabilities.prompts
        ? await this.fetchPrompts(client, options)
        : [];

      return {
        serverInfo,
        capabilities,
        instructions,
        tools,
        resources,
        prompts,
      };
    } finally {
      await client.close().catch(() => {});
    }
  }

  private async fetchTools(
    client: Client,
    options: RequestOptions,
  ): Promise<MCPToolInfo[]> {
    try {
      const { tools } = await client.listTools(undefined, options);
      return tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: (t.inputSchema as JsonObject) ?? {},
        outputSchema: t.outputSchema as JsonObject | undefined,
        annotations: t.annotations as MCPToolAnnotations | undefined,
      }));
    } catch (error) {
      this.logger.debug(`tools/list failed: ${(error as Error).message}`);
      return [];
    }
  }

  private async fetchResources(
    client: Client,
    options: RequestOptions,
  ): Promise<MCPResourceInfo[]> {
    try {
      const { resources } = await client.listResources(undefined, options);
      return resources.map(r => ({
        uri: r.uri,
        name: r.name,
        title: r.title as string | undefined,
        description: r.description as string | undefined,
        mimeType: r.mimeType as string | undefined,
        size: r.size as number | undefined,
      }));
    } catch (error) {
      this.logger.debug(`resources/list failed: ${(error as Error).message}`);
      return [];
    }
  }

  private async fetchPrompts(
    client: Client,
    options: RequestOptions,
  ): Promise<MCPPromptInfo[]> {
    try {
      const { prompts } = await client.listPrompts(undefined, options);
      return prompts.map(p => ({
        name: p.name,
        title: p.title as string | undefined,
        description: p.description as string | undefined,
        arguments: p.arguments as MCPPromptInfo['arguments'],
      }));
    } catch (error) {
      this.logger.debug(`prompts/list failed: ${(error as Error).message}`);
      return [];
    }
  }
}
