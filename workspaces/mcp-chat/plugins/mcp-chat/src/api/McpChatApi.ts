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
import { ResponseError } from '@backstage/errors';
import {
  ChatMessage,
  ChatResponse,
  MCPServerStatusData,
  ProviderStatusData,
  ToolsResponse,
} from '../types';

/**
 * @public
 */
export interface McpChatApi {
  sendChatMessage(
    messages: ChatMessage[],
    enabledTools?: string[],
    signal?: AbortSignal,
  ): Promise<ChatResponse>;
  getMCPServerStatus(): Promise<MCPServerStatusData>;
  getAvailableTools(): Promise<ToolsResponse>;
  getProviderStatus(): Promise<ProviderStatusData>;
}

export class McpChat implements McpChatApi {
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
    const baseUrl = await this.discoveryApi.getBaseUrl('mcp-chat');

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
      throw await ResponseError.fromResponse(response);
    }

    return response.json();
  }

  async getMCPServerStatus(): Promise<MCPServerStatusData> {
    const baseUrl = await this.discoveryApi.getBaseUrl('mcp-chat');
    const response = await this.fetchApi.fetch(`${baseUrl}/mcp/status`);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json();
  }

  async getAvailableTools(): Promise<ToolsResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('mcp-chat');

    const response = await this.fetchApi.fetch(`${baseUrl}/tools`);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json();
  }

  async getProviderStatus(): Promise<ProviderStatusData> {
    const baseUrl = await this.discoveryApi.getBaseUrl('mcp-chat');

    const response = await this.fetchApi.fetch(`${baseUrl}/provider/status`);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json();
  }
}
