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

import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

/**
 * @public
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * @public
 */
export interface ChatResponse {
  role: 'assistant';
  content: string;
  toolResponses?: any[];
  toolsUsed?: string[];
}

/**
 * @public
 */
export interface ConfigStatus {
  provider: any;
  mcpServers: Array<{
    id?: string;
    name: string;
    type: string;
    hasUrl: boolean;
    hasNpxCommand: boolean;
    hasScriptPath: boolean;
  }>;
}

/**
 * @public
 */
export interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: any;
  };
  serverId: string;
}

/**
 * @public
 */
export interface ToolsResponse {
  message: string;
  serverConfigs: Array<{
    name: string;
    type: string;
    hasUrl: boolean;
    hasNpxCommand: boolean;
    hasScriptPath: boolean;
  }>;
  availableTools: Tool[];
  toolCount: number;
  timestamp: string;
}

/**
 * @public
 */
export interface McpChatApi {
  sendChatMessage(
    messages: ChatMessage[],
    enabledTools?: string[],
    signal?: AbortSignal,
  ): Promise<ChatResponse>;
  getConfigStatus(): Promise<ConfigStatus>;
  getAvailableTools(): Promise<ToolsResponse>;
  testProviderConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
    message?: string;
    timestamp?: string;
  }>;
}

export class McpChatClient implements McpChatApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async sendChatMessage(
    messages: ChatMessage[],
    enabledTools: string[] = [],
    signal?: AbortSignal,
  ): Promise<ChatResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('mcp-chat-client');

    const response = await this.fetchApi.fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        enabledTools,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getConfigStatus(): Promise<ConfigStatus> {
    const baseUrl = await this.discoveryApi.getBaseUrl('mcp-chat-client');

    const response = await this.fetchApi.fetch(`${baseUrl}/config/status`);

    if (!response.ok) {
      throw new Error(`Config status request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getAvailableTools(): Promise<ToolsResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('mcp-chat-client');

    const response = await this.fetchApi.fetch(`${baseUrl}/test/tools`);

    if (!response.ok) {
      throw new Error(`Tools request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async testProviderConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
    message?: string;
    timestamp?: string;
  }> {
    const baseUrl = await this.discoveryApi.getBaseUrl('mcp-chat-client');

    const response = await this.fetchApi.fetch(
      `${baseUrl}/test/provider-connection`,
    );

    if (!response.ok) {
      throw new Error(
        `Provider connection test failed: ${response.statusText}`,
      );
    }

    return response.json();
  }
}
