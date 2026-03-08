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

import type { SecurityMode } from '@backstage-community/plugin-agentic-chat-common';

/**
 * Approval filter for fine-grained HITL control
 * Specifies which tools always or never require approval
 * @public
 */
export interface ApprovalFilter {
  /** Tool names that always require approval */
  always?: string[];
  /** Tool names that never require approval (auto-execute) */
  never?: string[];
}

/**
 * OAuth configuration shared between per-server and global security modes.
 * @public
 */
export interface OAuthClientConfig {
  /** OAuth token endpoint URL (e.g., Keycloak token endpoint) */
  tokenUrl: string;
  /** OAuth client ID (service account client) */
  clientId: string;
  /** OAuth client secret */
  clientSecret: string;
  /** OAuth scopes to request (default: ['openid']) */
  scopes?: string[];
}

/**
 * @public
 * @deprecated Use {@link OAuthClientConfig} directly. Kept for backward compatibility.
 */
export type SecurityMcpOAuthConfig = OAuthClientConfig;

/**
 * Security configuration for Agentic Chat
 *
 * Controls authentication and authorization at multiple levels:
 * - Plugin access (Backstage RBAC)
 * - MCP server authentication (OAuth)
 *
 * @public
 */
export interface SecurityConfig {
  /**
   * Security mode:
   * - 'none': No access control - anyone can use Agentic Chat
   * - 'plugin-only': Keycloak group controls plugin access, MCP servers are open (default)
   * - 'full': Keycloak auth for both plugin AND MCP server authentication
   */
  mode: SecurityMode;

  /**
   * Custom message shown when access is denied
   */
  accessDeniedMessage?: string;

  /**
   * OAuth configuration for MCP server authentication
   * Only used in 'full' mode
   */
  mcpOAuth?: SecurityMcpOAuthConfig;
}

/**
 * @public
 * @deprecated Use {@link OAuthClientConfig} directly. Kept for backward compatibility.
 */
export type MCPServerOAuthConfig = OAuthClientConfig;

/**
 * Kubernetes ServiceAccount configuration for MCP server authentication
 * @public
 */
export interface MCPServerServiceAccountConfig {
  /** ServiceAccount name in the cluster */
  name: string;
  /** Namespace of the ServiceAccount (default: current namespace or 'default') */
  namespace?: string;
}

/**
 * Named authentication configuration (for reuse across MCP servers)
 * @public
 */
export type MCPAuthConfig =
  | ({ type: 'oauth' } & MCPServerOAuthConfig)
  | ({ type: 'serviceAccount' } & MCPServerServiceAccountConfig);

/**
 * MCP Server configuration
 * @public
 */
export interface MCPServerConfig {
  /** Unique identifier for the server */
  id: string;
  /** Display name for the server */
  name: string;
  /** Server type - only streamable-http and sse work with Responses API */
  type: 'streamable-http' | 'sse';
  /** URL for HTTP/SSE servers */
  url: string;
  /** Optional static headers for authentication */
  headers?: Record<string, string>;
  /** Reference to a named auth config from agenticChat.mcpAuth */
  authRef?: string;
  /** OAuth configuration for dynamic token authentication */
  oauth?: MCPServerOAuthConfig;
  /** Kubernetes ServiceAccount configuration */
  serviceAccount?: MCPServerServiceAccountConfig;
  /**
   * Human-in-the-loop approval requirement
   * - 'always': All tools require user approval before execution
   * - 'never': All tools execute automatically (default)
   * - ApprovalFilter: Fine-grained control per tool name
   */
  requireApproval?: 'always' | 'never' | ApprovalFilter;
  /**
   * Restrict which tools from this server are exposed to the model.
   * When set, only the named tools are sent — all others are ignored.
   * This dramatically reduces token usage for servers with many tools.
   */
  allowedTools?: string[];
}
