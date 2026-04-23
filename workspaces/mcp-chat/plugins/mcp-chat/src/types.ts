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
  // For HTTP connections
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
 * Approval lifecycle states for a tool call.
 *
 * - `pending` — awaiting user decision
 * - `approved` — user approved execution
 * - `rejected` — user rejected execution
 *
 * @public
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Subset of {@link ApprovalStatus} representing a final user decision.
 *
 * @public
 */
export type ConfirmedStatus = Exclude<ApprovalStatus, 'pending'>;

/**
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
  /** Additional parameters */
  metadata?: {
    /** MCP server ID that provides this tool (not sent to LLM) */
    serverId?: string;
    /** Approval status for this tool call (not sent to LLM) */
    approval_status?: ApprovalStatus;
  };
}

/**
 * Valid roles for a chat message author.
 *
 * @public
 */
export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * @public
 */
export interface ChatMessage {
  /** The role of the message author */
  role: ChatRole;
  /** Message content. Can be null for assistant messages that only contain tool calls. */
  content: string | null;
  /** Tool calls requested by the assistant. Only present when role is 'assistant' and the LLM decided to call some tools. */
  tool_calls?: ToolCall[];
  /** ID of the tool call this message responds to. Required when role is 'tool'. */
  tool_call_id?: string;

  metadata: {
    id: string;
    timestamp: Date;
  };
}

/**
 * @public
 */
export interface ChatResponse {
  /** Array of chat messages in the conversation */
  messages: ChatMessage[];
  /** A unique ID for the conversation. */
  conversationId: string;
}

/**
 * A stored conversation record from the backend.
 * @public
 */
export interface ConversationRecord {
  /** Unique identifier for the conversation */
  id: string;
  /** User entity ref who owns this conversation */
  userId: string;
  /** Array of chat messages in the conversation */
  messages: ChatMessage[];
  /** Optional array of tool names used in the conversation */
  toolsUsed?: string[];
  /** AI-generated or user-edited conversation title */
  title?: string;
  /** Whether the conversation is starred/favorited */
  isStarred: boolean;
  /** ISO timestamp when the conversation was created */
  createdAt: string;
  /** ISO timestamp when the conversation was last updated */
  updatedAt: string;
}

/**
 * Response from the /conversations endpoint.
 * @public
 */
export interface ConversationsResponse {
  /** Array of conversation records */
  conversations: ConversationRecord[];
  /** Total count of conversations returned */
  count: number;
}
