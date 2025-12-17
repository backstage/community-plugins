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

import {
  ChatMessage,
  MCPServer,
  MCPServerStatusData,
  ProviderStatusData,
  QueryResponse,
  ServerTool,
} from '../types';

/**
 * Service interface for MCP (Model Context Protocol) client operations.
 * Provides methods for interacting with LLM providers and MCP tool servers.
 *
 * Use this interface when you need to:
 * - Send queries to an LLM with optional tool support
 * - Manage MCP server connections
 * - Check provider and server health status
 *
 * @example
 * ```typescript
 * // Get the service from Backstage backend
 * const mcpService = await coreServices.service(mcpClientServiceRef);
 *
 * // Send a query
 * const response = await mcpService.processQuery(
 *   [{ role: 'user', content: 'List files in /tmp' }],
 *   ['filesystem__list_files']
 * );
 * console.log(response.reply);
 * ```
 *
 * @public
 */
export interface MCPClientService {
  /**
   * Initializes connections to all configured MCP servers.
   * This is typically called during plugin startup.
   *
   * @returns Promise resolving to array of MCP servers with their connection status
   */
  initializeMCPServers(): Promise<MCPServer[]>;

  /**
   * Processes a chat query through the LLM provider.
   * Automatically handles tool calls if the LLM requests them.
   *
   * @param messagesInput - Array of chat messages representing the conversation
   * @param enabledTools - Optional array of server IDs to enable. If undefined, all tools are enabled.
   *                       If empty array, no tools are enabled.
   * @returns Promise resolving to the query response with reply and tool execution details
   *
   * @example
   * ```typescript
   * // Enable all tools
   * const response = await service.processQuery(messages);
   *
   * // Enable specific servers only
   * const response = await service.processQuery(messages, ['kubernetes-server']);
   *
   * // Disable all tools
   * const response = await service.processQuery(messages, []);
   * ```
   */
  processQuery(
    messagesInput: ChatMessage[],
    enabledTools?: string[],
  ): Promise<QueryResponse>;

  /**
   * Returns all tools available from connected MCP servers.
   * Each tool includes its server ID for routing purposes.
   *
   * @returns Array of server tools with their definitions
   */
  getAvailableTools(): ServerTool[];

  /**
   * Gets the current status of the configured LLM provider.
   * Useful for health checks and monitoring.
   *
   * @returns Promise resolving to provider status including connection health
   */
  getProviderStatus(): Promise<ProviderStatusData>;

  /**
   * Gets the current status of all configured MCP servers.
   * Useful for health checks and monitoring.
   *
   * @returns Promise resolving to MCP server status including connection states
   */
  getMCPServerStatus(): Promise<MCPServerStatusData>;
}
