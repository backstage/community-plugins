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

// MCP-related types and interfaces

export interface BaseServerConfig {
  id: string;
  name: string;
  // For STDIO connections
  scriptPath?: string;
  npxCommand?: string;
  args?: string[];
  // For SSE connections
  url?: string;
  // Connection type
  type: 'stdio' | 'sse' | 'streamable-http';
}

export interface ConfidentialServerConfig {
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

export type ServerConfig = BaseServerConfig & ConfidentialServerConfig;

export type MCPServer = BaseServerConfig & {
  status: {
    valid: boolean;
    connected: boolean;
    error?: string;
  };
};

export interface MCPServerStatusData {
  total: number;
  valid: number;
  active: number;
  servers: MCPServer[];
}

export interface ProviderStatusData {
  providers: Provider[];
  summary: {
    totalProviders: number;
    healthyProviders: number;
    error?: string;
  };
  timestamp: string;
}

export interface Provider {
  id: string;
  model: string;
  baseUrl: string;
  connection: ProviderConnectionStatus;
}

export interface ProviderConnectionStatus {
  connected: boolean;
  models?: string[];
  error?: string;
}
