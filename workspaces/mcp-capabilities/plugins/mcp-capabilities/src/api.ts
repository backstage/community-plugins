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
import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/frontend-plugin-api';
import { MCPServerSpec } from '@backstage-community/plugin-mcp-capabilities-common';

/**
 * Client for the MCP discovery backend.
 *
 * @public
 */
export interface McpCapabilitiesApi {
  /** Live discovery of a native mcp-server entity's tools/resources/prompts. */
  getServerSpec(entityRef: string): Promise<MCPServerSpec>;
}

/**
 * @public
 */
export const mcpCapabilitiesApiRef = createApiRef<McpCapabilitiesApi>({
  id: 'plugin.mcp-capabilities.client',
});

/**
 * Default {@link McpCapabilitiesApi} implementation, talking to `/api/mcp-capabilities`.
 *
 * @public
 */
export class McpCapabilitiesClient implements McpCapabilitiesApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getServerSpec(entityRef: string): Promise<MCPServerSpec> {
    const baseUrl = await this.discoveryApi.getBaseUrl('mcp-capabilities');
    const url = `${baseUrl}/spec?entityRef=${encodeURIComponent(entityRef)}`;
    const response = await this.fetchApi.fetch(url);
    if (!response.ok) {
      throw new Error(
        `MCP discovery failed (${response.status} ${response.statusText})`,
      );
    }
    return (await response.json()) as MCPServerSpec;
  }
}
