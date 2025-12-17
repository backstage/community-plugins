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
// Constants and Enums
// =============================================================================

/**
 * Valid roles for chat messages.
 * Use these values when constructing ChatMessage objects.
 *
 * @public
 */
export const VALID_ROLES = ['user', 'assistant', 'system', 'tool'] as const;

/**
 * MCP server connection types.
 *
 * - `STDIO`: Local process communication via stdin/stdout
 * - `SSE`: Server-Sent Events over HTTP
 * - `STREAMABLE_HTTP`: Streamable HTTP transport
 *
 * @public
 */
export enum MCPServerType {
  STDIO = 'stdio',
  SSE = 'sse',
  STREAMABLE_HTTP = 'streamable-http',
}

/**
 * Supported LLM provider types.
 * Use this type for type-safe provider selection.
 *
 * @public
 */
export type LLMProviderType =
  | 'openai'
  | 'openai-responses'
  | 'claude'
  | 'gemini'
  | 'ollama'
  | 'litellm';

// =============================================================================
// MCP Server Configuration Types
// =============================================================================

/**
 * Configuration for an MCP server.
 * Supports multiple connection types: STDIO, SSE, and Streamable HTTP.
 *
 * @example
 * ```typescript
 * // STDIO server using npx
 * const stdioServer: MCPServerConfig = {
 *   id: 'filesystem',
 *   name: 'File System',
 *   type: MCPServerType.STDIO,
 *   npxCommand: '@modelcontextprotocol/server-filesystem',
 *   args: ['/path/to/directory']
 * };
 *
 * // HTTP server
 * const httpServer: MCPServerConfig = {
 *   id: 'remote-api',
 *   name: 'Remote API',
 *   type: MCPServerType.STREAMABLE_HTTP,
 *   url: 'https://api.example.com/mcp'
 * };
 * ```
 *
 * @public
 */
export interface MCPServerConfig {
  /** Unique identifier for the server */
  id: string;
  /** Human-readable name for display */
  name: string;
  /** Connection type: stdio, sse, or streamable-http */
  type: MCPServerType;
  /** Path to a local script (for STDIO servers) */
  scriptPath?: string;
  /** NPX package command to run (for STDIO servers) */
  npxCommand?: string;
  /** Command-line arguments to pass to the server */
  args?: string[];
  /** URL endpoint (for SSE and HTTP servers) */
  url?: string;
}

/**
 * Sensitive configuration for an MCP server.
 * Contains environment variables and HTTP headers that may include secrets.
 *
 * @example
 * ```typescript
 * const secrets: MCPServerSecrets = {
 *   env: {
 *     API_KEY: 'your-secret-key',
 *     DATABASE_URL: 'postgres://...'
 *   },
 *   headers: {
 *     'Authorization': 'Bearer token123'
 *   }
 * };
 * ```
 *
 * @public
 */
export interface MCPServerSecrets {
  /** Environment variables to pass to the server process */
  env?: Record<string, string>;
  /** HTTP headers to include in requests (for HTTP-based servers) */
  headers?: Record<string, string>;
}

/**
 * Complete MCP server configuration combining base config and secrets.
 *
 * @public
 */
export type MCPServerFullConfig = MCPServerConfig & MCPServerSecrets;

/**
 * MCP server with runtime status information.
 * Used to display server health in the UI.
 *
 * @public
 */
export type MCPServer = MCPServerConfig & {
  /** Current connection and validation status */
  status: {
    /** Whether the server configuration is valid */
    valid: boolean;
    /** Whether the server is currently connected */
    connected: boolean;
    /** Error message if connection failed */
    error?: string;
  };
};

/**
 * Aggregated status data for all MCP servers.
 *
 * @public
 */
export interface MCPServerStatusData {
  /** Total number of configured servers */
  total: number;
  /** Number of servers with valid configuration */
  valid: number;
  /** Number of currently connected servers */
  active: number;
  /** List of all servers with their status */
  servers: MCPServer[];
  /** ISO timestamp of when this status was generated */
  timestamp: string;
}

// =============================================================================
// LLM Provider Configuration Types
// =============================================================================

/**
 * Configuration for an LLM provider.
 *
 * @example
 * ```typescript
 * const openaiConfig: ProviderConfig = {
 *   type: 'openai',
 *   apiKey: 'sk-...',
 *   baseUrl: 'https://api.openai.com/v1',
 *   model: 'gpt-4'
 * };
 *
 * const ollamaConfig: ProviderConfig = {
 *   type: 'ollama',
 *   baseUrl: 'http://localhost:11434',
 *   model: 'llama2'
 * };
 * ```
 *
 * @public
 */
export interface ProviderConfig {
  /** Provider type identifier */
  type: string;
  /** API key for authentication (optional for local providers like Ollama) */
  apiKey?: string;
  /** Base URL for the provider's API */
  baseUrl: string;
  /** Model identifier to use */
  model: string;
}

/**
 * Runtime information about an active LLM provider.
 * Used for status display and monitoring.
 *
 * @public
 */
export interface ProviderInfo {
  /** Provider type identifier (e.g., 'openai', 'claude') */
  id: string;
  /** Currently configured model */
  model: string;
  /** API base URL */
  baseUrl: string;
  /** Current connection status */
  connection: ProviderConnectionStatus;
}

/**
 * Connection test result for an LLM provider.
 *
 * @public
 */
export interface ProviderConnectionStatus {
  /** Whether the provider is reachable and authenticated */
  connected: boolean;
  /** List of available models (if supported by the provider) */
  models?: string[];
  /** Error message if connection failed */
  error?: string;
}

/**
 * Aggregated status data for all LLM providers.
 *
 * @public
 */
export interface ProviderStatusData {
  /** List of all configured providers with their status */
  providers: ProviderInfo[];
  /** Summary statistics */
  summary: {
    /** Total number of configured providers */
    totalProviders: number;
    /** Number of providers that passed connection test */
    healthyProviders: number;
    /** Error message if status check failed */
    error?: string;
  };
  /** ISO timestamp of when this status was generated */
  timestamp: string;
}

// =============================================================================
// Chat Message Types
// =============================================================================

/**
 * A chat message in the conversation.
 * Compatible with OpenAI's Chat Completions API message format.
 *
 * @example
 * ```typescript
 * // User message
 * const userMsg: ChatMessage = {
 *   role: 'user',
 *   content: 'What files are in the current directory?'
 * };
 *
 * // Assistant message with tool call
 * const assistantMsg: ChatMessage = {
 *   role: 'assistant',
 *   content: null,
 *   tool_calls: [{
 *     id: 'call_123',
 *     type: 'function',
 *     function: { name: 'list_files', arguments: '{"path": "."}' }
 *   }]
 * };
 *
 * // Tool response
 * const toolMsg: ChatMessage = {
 *   role: 'tool',
 *   content: '["file1.txt", "file2.txt"]',
 *   tool_call_id: 'call_123'
 * };
 * ```
 *
 * @public
 */
export interface ChatMessage {
  /** The role of the message author */
  role: 'system' | 'user' | 'assistant' | 'tool';
  /** Message content. Can be null for assistant messages that only contain tool calls. */
  content: string | null;
  /** Tool calls requested by the assistant. Only present when role is 'assistant'. */
  tool_calls?: ToolCall[];
  /** ID of the tool call this message responds to. Required when role is 'tool'. */
  tool_call_id?: string;
}

/**
 * Response from an LLM provider.
 * Follows OpenAI's Chat Completions API response format.
 *
 * @public
 */
export interface ChatResponse {
  /** Array of response choices (typically contains one choice) */
  choices: [
    {
      /** The generated message */
      message: {
        /** Always 'assistant' for responses */
        role: 'assistant';
        /** Text content of the response. Null if only tool calls are present. */
        content: string | null;
        /** Tool calls the model wants to make */
        tool_calls?: ToolCall[];
      };
    },
  ];
  /** Token usage statistics (if provided by the model) */
  usage?: {
    /** Number of tokens in the input prompt */
    prompt_tokens: number;
    /** Number of tokens in the generated response */
    completion_tokens: number;
    /** Total tokens used */
    total_tokens: number;
  };
}

/**
 * Complete response from a chat query including tool execution results.
 *
 * @public
 */
export interface QueryResponse {
  /** The final text reply from the assistant */
  reply: string;
  /** Tool calls that were made during the conversation */
  toolCalls: ToolCall[];
  /** Results from executing the tool calls */
  toolResponses: ToolExecutionResult[];
}

// =============================================================================
// Tool Types
// =============================================================================

/**
 * Tool definition in OpenAI function calling format.
 * Describes a tool that the LLM can invoke.
 *
 * @example
 * ```typescript
 * const tool: Tool = {
 *   type: 'function',
 *   function: {
 *     name: 'get_weather',
 *     description: 'Get the current weather for a location',
 *     parameters: {
 *       type: 'object',
 *       properties: {
 *         location: { type: 'string', description: 'City name' },
 *         unit: { type: 'string', enum: ['celsius', 'fahrenheit'] }
 *       },
 *       required: ['location']
 *     }
 *   }
 * };
 * ```
 *
 * @public
 */
export interface Tool {
  /** Always 'function' for function-calling tools */
  type: 'function';
  /** Function definition */
  function: {
    /** Unique name of the function */
    name: string;
    /** Description of what the function does (shown to the LLM) */
    description: string;
    /** JSON Schema describing the function parameters (flexible to support various LLM providers) */
    parameters: Record<string, unknown>;
  };
}

/**
 * A tool call made by the LLM.
 * Represents the model's request to invoke a specific tool.
 *
 * @example
 * ```typescript
 * const toolCall: ToolCall = {
 *   id: 'call_abc123',
 *   type: 'function',
 *   function: {
 *     name: 'get_weather',
 *     arguments: '{"location": "San Francisco", "unit": "celsius"}'
 *   }
 * };
 *
 * // Parse the arguments
 * const args = JSON.parse(toolCall.function.arguments);
 * ```
 *
 * @public
 */
export interface ToolCall {
  /** Unique identifier for this tool call */
  id: string;
  /** Always 'function' for function calls */
  type: 'function';
  /** Function invocation details */
  function: {
    /** Name of the function to call */
    name: string;
    /** JSON-encoded string of the function arguments */
    arguments: string;
  };
}

/**
 * Tool associated with a specific MCP server.
 * Extends the base Tool with server identification for routing.
 *
 * @public
 */
export interface ServerTool extends Tool {
  /** ID of the MCP server that provides this tool */
  serverId: string;
}

/**
 * Result of executing a tool call.
 *
 * @public
 */
export interface ToolExecutionResult {
  /** ID of the original tool call */
  id: string;
  /** Name of the tool that was executed */
  name: string;
  /** Parsed arguments that were passed to the tool */
  arguments: Record<string, unknown>;
  /** String result returned by the tool */
  result: string;
  /** ID of the MCP server that executed the tool */
  serverId: string;
}

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Result of validating chat messages.
 *
 * @example
 * ```typescript
 * const result = validateMessages(messages);
 * if (!result.isValid) {
 *   console.error('Validation failed:', result.error);
 * }
 * ```
 *
 * @public
 */
export interface MessageValidationResult {
  /** Whether the messages passed validation */
  isValid: boolean;
  /** Error message describing the validation failure */
  error?: string;
}

// =============================================================================
// OpenAI Responses API Types
// =============================================================================

/**
 * MCP tool configuration for OpenAI Responses API.
 * Used to configure native MCP support in the Responses API.
 *
 * @public
 */
export interface ResponsesApiMcpTool {
  /** Tool type identifier */
  type: 'mcp';
  /** URL of the MCP server */
  server_url: string;
  /** Human-readable label for the server */
  server_label: string;
  /** When to require user approval for tool calls */
  require_approval: 'never' | 'always' | 'auto';
  /** List of allowed tool names (if not set, all tools are allowed) */
  allowed_tools?: string[];
  /** HTTP headers to send with requests */
  headers?: Record<string, string>;
}

/**
 * MCP list tools output event from OpenAI Responses API.
 *
 * @public
 */
export interface ResponsesApiMcpListTools {
  /** Event ID */
  id: string;
  /** Event type identifier */
  type: 'mcp_list_tools';
  /** Label of the server that provided the tools */
  server_label: string;
  /** List of available tools */
  tools: Array<{
    /** Tool name */
    name: string;
    /** Tool description */
    description: string;
    /** JSON Schema for tool input */
    input_schema: Record<string, unknown>;
  }>;
}

/**
 * MCP tool call output event from OpenAI Responses API.
 *
 * @public
 */
export interface ResponsesApiMcpCall {
  /** Event ID */
  id: string;
  /** Event type identifier */
  type: 'mcp_call';
  /** Name of the tool that was called */
  name: string;
  /** JSON-encoded arguments passed to the tool */
  arguments: string;
  /** Label of the server that handled the call */
  server_label: string;
  /** Error message if the call failed */
  error: string | null;
  /** Output from the tool call */
  output: string;
}

/**
 * Message output event from OpenAI Responses API.
 *
 * @public
 */
export interface ResponsesApiMessage {
  /** Event ID */
  id: string;
  /** Event type identifier */
  type: 'message';
  /** Message role */
  role: 'assistant';
  /** Completion status */
  status: 'completed' | 'failed';
  /** Message content blocks */
  content: Array<{
    /** Content type */
    type: 'output_text';
    /** Text content */
    text: string;
    /** Optional annotations */
    annotations?: unknown[];
  }>;
}

/**
 * Union type for all possible output events from OpenAI Responses API.
 *
 * @public
 */
export type ResponsesApiOutputEvent =
  | ResponsesApiMcpListTools
  | ResponsesApiMcpCall
  | ResponsesApiMessage;

/**
 * Complete response from OpenAI Responses API.
 *
 * @public
 */
export interface ResponsesApiResponse {
  /** Response ID */
  id: string;
  /** Object type */
  object: 'response';
  /** Unix timestamp of creation */
  created_at: number;
  /** Model used for generation */
  model: string;
  /** Response status */
  status: 'completed' | 'failed' | 'cancelled';
  /** Output events from the response */
  output: ResponsesApiOutputEvent[];
  /** Token usage statistics */
  usage?: {
    /** Input tokens used */
    input_tokens: number;
    /** Output tokens generated */
    output_tokens: number;
    /** Total tokens */
    total_tokens: number;
    /** Detailed input token breakdown */
    input_tokens_details?: {
      /** Tokens served from cache */
      cached_tokens: number;
    };
    /** Detailed output token breakdown */
    output_tokens_details?: unknown;
  };
  /** Error message if failed */
  error?: string | null;
  /** System instructions */
  instructions?: string | null;
  /** Configured tools */
  tools?: ResponsesApiMcpTool[];
  /** Whether parallel tool calls are enabled */
  parallel_tool_calls?: boolean;
  /** ID of the previous response in a conversation */
  previous_response_id?: string | null;
  /** Temperature setting used */
  temperature?: number | null;
  /** Top-p setting used */
  top_p?: number | null;
  /** Text format configuration */
  text?: {
    format: {
      type: string;
    };
  };
  /** Truncation settings */
  truncation?: unknown;
}
