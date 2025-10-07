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

/**
 * MCP server connection types
 * @public
 */
export enum MCPServerType {
  STDIO = 'stdio',
  SSE = 'sse',
  STREAMABLE_HTTP = 'streamable-http',
}

/**
 * @public
 */
export interface ProviderStatusData {
  providers: Provider[];
  summary: {
    totalProviders: number;
    healthyProviders: number;
    error?: string;
  };
  timestamp: string;
}

/**
 * @public
 */
export interface Provider {
  id: string;
  model: string;
  baseUrl: string;
  connection: ProviderConnectionStatus;
}

/**
 * @public
 */
export interface ProviderConnectionStatus {
  connected: boolean;
  models?: string[];
  error?: string;
}

/**
 * @public
 */
export interface MCPServerStatusData {
  total: number;
  valid: number;
  active: number;
  servers: MCPServer[];
  timestamp: string;
}

/**
 * @public
 */
export interface MCPServer {
  id: string;
  name: string;
  // For STDIO connections
  scriptPath?: string;
  npxCommand?: string;
  args?: string[];
  // For SSE connections
  url?: string;
  // Connection type
  type: MCPServerType;
  status: {
    valid: boolean;
    connected: boolean;
    error?: string;
  };
  // Field to indicate if the server is enabled in the UI
  enabled: boolean;
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
