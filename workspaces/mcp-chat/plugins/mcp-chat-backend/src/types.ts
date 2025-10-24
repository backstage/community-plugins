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

// =============================================================================
// Constants
// =============================================================================

/** Valid roles for chat messages */
export const VALID_ROLES = ['user', 'assistant', 'system', 'tool'] as const;

/** MCP server connection types */
export enum MCPServerType {
  STDIO = 'stdio',
  SSE = 'sse',
  STREAMABLE_HTTP = 'streamable-http',
}

// =============================================================================
// MCP Server Configuration Types
// =============================================================================

/**
 * Base configuration for an MCP server
 * Supports multiple connection types: STDIO, SSE, and Streamable HTTP
 */
export interface BaseServerConfig {
  id: string;
  name: string;
  type: MCPServerType;

  // STDIO connection options
  scriptPath?: string;
  npxCommand?: string;
  args?: string[];

  // SSE connection options
  url?: string;
}

/**
 * Confidential configuration for an MCP server
 * Contains sensitive data like environment variables and headers
 */
export interface ConfidentialServerConfig {
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

/** Complete server configuration combining base and confidential settings */
export type ServerConfig = BaseServerConfig & ConfidentialServerConfig;

/**
 * MCP Server with runtime status information
 * Extends base configuration with connection and validation status
 */
export type MCPServer = BaseServerConfig & {
  status: {
    valid: boolean;
    connected: boolean;
    error?: string;
  };
};

/**
 * Status data for all MCP servers
 * Provides an overview of server health and availability
 */
export interface MCPServerStatusData {
  total: number;
  valid: number;
  active: number;
  servers: MCPServer[];
  timestamp: string;
}

// =============================================================================
// LLM Provider Configuration Types
// =============================================================================

/**
 * Configuration for an LLM provider (OpenAI, Anthropic, Ollama, etc.)
 */
export interface ProviderConfig {
  type: string;
  apiKey?: string; // Optional for providers like Ollama
  baseUrl: string;
  model: string;
}

/**
 * Runtime provider information with connection status
 */
export interface Provider {
  id: string;
  model: string;
  baseUrl: string;
  connection: ProviderConnectionStatus;
}

/**
 * Connection status for an LLM provider
 */
export interface ProviderConnectionStatus {
  connected: boolean;
  models?: string[];
  error?: string;
}

/**
 * Status data for all LLM providers
 * Provides an overview of provider health and availability
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

// =============================================================================
// Chat Message Types
// =============================================================================

/**
 * A chat message in the conversation
 * Follows OpenAI's message format for compatibility
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
}

/**
 * Response from the LLM provider
 * Follows OpenAI's response format
 */
export interface ChatResponse {
  choices: [
    {
      message: {
        role: 'assistant';
        content: string | null;
        tool_calls?: ToolCall[];
      };
    },
  ];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Response from a query containing the reply and tool execution details
 */
export interface QueryResponse {
  reply: string;
  toolCalls: ToolCall[];
  toolResponses: any[];
}

// =============================================================================
// Tool Types
// =============================================================================

/**
 * Tool definition in OpenAI function calling format
 */
export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

/**
 * Tool call made by the LLM
 */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Tool associated with a specific MCP server
 * Extends the base Tool with server identification
 */
export interface ServerTool extends Tool {
  serverId: string;
}
