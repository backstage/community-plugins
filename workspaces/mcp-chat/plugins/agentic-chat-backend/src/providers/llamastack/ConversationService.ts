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
import { LoggerService, DatabaseService } from '@backstage/backend-plugin-api';
import { toErrorMessage } from '../../services/utils';
import type { LlamaStackClient } from './LlamaStackClient';
import { McpAuthService } from './McpAuthService';
import { MCPServerConfig } from '../../types';
import { McpProxyService } from './McpProxyService';
import { ConversationRegistry } from './ConversationRegistry';
import { executeApprovalContinuation } from './ApprovalContinuationExecutor';
import {
  mapRawItemsToConversationItems,
  mapRawInputItemsToNormalized,
  toConversationSummary,
} from './ConversationHelpers';
import {
  walkResponseChain as walkResponseChainFn,
  fetchResponsesFromApi as fetchResponsesFromApiFn,
} from './ResponseChainWalker';
import { getInputText, processConversationItems } from './MessageProcessor';
import type {
  ConversationClientAccessor,
  ConversationListResult,
  ConversationDetails,
  ConversationSummary,
  InputItemsResult,
  ConversationItemsResult,
  ProcessedMessage,
  ApprovalResult,
} from './conversationTypes';

export type {
  ConversationClientAccessor,
  ConversationListResult,
  ConversationDetails,
  InputItem,
  InputItemsResult,
  ConversationItem,
  ConversationItemsResult,
  ProcessedToolCall,
  ProcessedRagSource,
  ProcessedMessage,
  ApprovalResult,
  ConversationSummary,
} from './conversationTypes';

/**
 * Conversation Service
 *
 * Manages conversation history using the Llama Stack Responses API:
 * - Listing conversations
 * - Getting conversation details
 * - Getting conversation input items
 * - Deleting conversations
 * - Human-in-the-Loop (HITL) approval handling
 */
export class ConversationService {
  private readonly clientAccessor: ConversationClientAccessor;
  private readonly mcpAuth: McpAuthService;
  private readonly mcpServers: MCPServerConfig[];
  private readonly logger: LoggerService;
  private readonly registry: ConversationRegistry;
  private proxyModeEnabled = false;
  private mcpProxy?: McpProxyService;

  constructor(
    clientAccessor: ConversationClientAccessor,
    mcpAuth: McpAuthService,
    mcpServers: MCPServerConfig[],
    logger: LoggerService,
    database?: DatabaseService,
  ) {
    this.clientAccessor = clientAccessor;
    this.mcpAuth = mcpAuth;
    this.mcpServers = mcpServers;
    this.logger = logger;
    this.registry = new ConversationRegistry(database, logger);
  }

  setProxyMode(enabled: boolean, proxy?: McpProxyService): void {
    this.proxyModeEnabled = enabled;
    this.mcpProxy = proxy;
  }

  /** Convenience — returns the current LlamaStackClient. */
  private get client(): LlamaStackClient {
    return this.clientAccessor.getClient();
  }

  /**
   * Set up the database table if DatabaseService is available.
   * Falls back to in-memory if no database is configured.
   */
  async initializeDatabase(): Promise<void> {
    await this.registry.initializeDatabase();
  }

  /**
   * Records a conversation's first stored turn. Returns true if this is
   * the first call for this conversationId (i.e. it was not yet tracked).
   */
  markFirstStoredTurn(conversationId: string): boolean {
    return this.registry.markFirstStoredTurn(conversationId);
  }

  /**
   * Register a mapping from a response ID to its conversation ID.
   */
  async registerResponse(
    conversationId: string,
    responseId: string,
  ): Promise<void> {
    await this.registry.registerResponse(conversationId, responseId);
  }

  /**
   * Look up the conversationId for a response (if known).
   */
  async getConversationForResponse(
    responseId: string,
  ): Promise<string | undefined> {
    return this.registry.getConversationForResponse(responseId);
  }

  /**
   * List stored conversations (responses) from Llama Stack
   * Uses GET /v1/openai/v1/responses API
   */
  async listConversations(
    limit: number = 10,
    order: 'asc' | 'desc' = 'desc',
    after?: string,
  ): Promise<ConversationListResult> {
    const result = await this.fetchConversationsWithLimit(limit, order, after);

    return {
      conversations: result.conversations,
      hasMore: result.hasMore,
      lastId: result.lastId,
    };
  }

  /**
   * Get a specific conversation by ID
   * Uses GET /v1/openai/v1/responses/{response_id}
   */
  async getConversation(
    responseId: string,
  ): Promise<ConversationDetails | null> {
    this.logger.debug(`Getting conversation ${responseId}`);

    try {
      const response = await this.client.request<{
        id: string;
        model: string;
        status: string;
        created_at: number;
        input: unknown; // Can be string or array
        output: Array<{
          type: string;
          id?: string;
          role?: string;
          content?: Array<{ type: string; text: string }>;
        }>;
        previous_response_id?: string;
      }>(`/v1/openai/v1/responses/${responseId}`, { method: 'GET' });

      this.logger.info(
        `Got conversation ${responseId}, input type: ${typeof response.input}, isArray: ${Array.isArray(
          response.input,
        )}, input length: ${
          Array.isArray(response.input) ? response.input.length : 'n/a'
        }, output items: ${response.output?.length || 0}`,
      );

      return {
        id: response.id,
        model: response.model,
        status: response.status,
        createdAt: new Date(response.created_at * 1000),
        input: response.input,
        output: response.output || [],
        previousResponseId: response.previous_response_id,
      };
    } catch (error) {
      const errorMsg = toErrorMessage(error);
      // Check if this is a Llama Stack schema validation error (common with MCP tool calls)
      if (errorMsg.includes('400') || errorMsg.includes('Bad Request')) {
        this.logger.warn(
          `Llama Stack schema validation error for ${responseId} - response may contain MCP tool calls that can't be serialized`,
        );
      } else {
        this.logger.warn(
          `Failed to get conversation ${responseId}: ${errorMsg}`,
        );
      }
      return null;
    }
  }

  /**
   * Get input items (conversation context) for a response
   * Uses GET /v1/openai/v1/responses/{response_id}/input_items
   */
  async getConversationInputs(responseId: string): Promise<InputItemsResult> {
    this.logger.debug(`Getting input items for response ${responseId}`);

    try {
      const response = await this.client.request<{
        data: Array<{
          type: string;
          id?: string;
          role?: string;
          content?: unknown; // Can be string, array, or other formats
          status?: string;
          call_id?: string;
          output?: string;
        }>;
        has_more: boolean;
      }>(`/v1/openai/v1/responses/${responseId}/input_items`, {
        method: 'GET',
      });

      const normalizedItems = mapRawInputItemsToNormalized(
        (response.data || []) as Array<Record<string, unknown>>,
      );

      this.logger.info(
        `Got ${normalizedItems.length} input items for response ${responseId}`,
      );

      return {
        items: normalizedItems,
        hasMore: response.has_more || false,
      };
    } catch (error) {
      const errorMsg = toErrorMessage(error);
      // This endpoint may also fail with schema validation errors
      if (errorMsg.includes('400') || errorMsg.includes('Bad Request')) {
        this.logger.warn(
          `Llama Stack schema validation error for input_items ${responseId} - conversation may contain MCP tool calls`,
        );
      } else {
        this.logger.warn(
          `Failed to get conversation inputs for ${responseId}: ${errorMsg}`,
        );
      }
      return { items: [], hasMore: false };
    }
  }

  /**
   * Delete a conversation (response) from Llama Stack.
   * Uses DELETE /v1/openai/v1/responses/{response_id}
   *
   * If a `conversationId` is provided, the Llama Stack conversation
   * container is also deleted via DELETE /v1/conversations/{id}.
   * Failure to delete the container is non-fatal — the response
   * deletion is the critical operation.
   */
  async deleteConversation(
    responseId: string,
    conversationId?: string,
  ): Promise<boolean> {
    try {
      await this.client.request(`/v1/openai/v1/responses/${responseId}`, {
        method: 'DELETE',
      });
      this.logger.info(`Deleted response ${responseId}`);
    } catch (error) {
      this.logger.warn(
        `Failed to delete response ${responseId}: ${toErrorMessage(error)}`,
      );
      return false;
    }

    if (conversationId) {
      try {
        await this.client.request(`/v1/conversations/${conversationId}`, {
          method: 'DELETE',
        });
        this.logger.info(`Deleted conversation container ${conversationId}`);
      } catch (error) {
        this.logger.warn(
          `Failed to delete conversation container ${conversationId} (non-fatal): ${toErrorMessage(
            error,
          )}`,
        );
      }
    }

    return true;
  }

  /**
   * Create a new Llama Stack conversation container.
   * Uses POST /v1/conversations
   */
  async createConversation(): Promise<string> {
    this.logger.info('Creating new Llama Stack conversation');

    try {
      const response = await this.client.request<{ id: string }>(
        '/v1/conversations',
        {
          method: 'POST',
          body: JSON.stringify({}),
        },
      );

      this.logger.info(`Created conversation: ${response.id}`);
      return response.id;
    } catch (error) {
      const errorMsg = toErrorMessage(error);
      this.logger.error(`Failed to create conversation: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Get all items for a Llama Stack conversation in chronological order.
   * Uses GET /v1/conversations/{conversation_id}/items
   */
  async getConversationItems(
    conversationId: string,
  ): Promise<ConversationItemsResult> {
    this.logger.info(`Getting items for conversation ${conversationId}`);

    try {
      const response = await this.client.request<{
        data: Array<Record<string, unknown>>;
      }>(`/v1/conversations/${conversationId}/items?order=asc`, {
        method: 'GET',
      });

      const items = mapRawItemsToConversationItems(
        (response.data || []) as Array<Record<string, unknown>>,
      );

      this.logger.info(
        `Got ${items.length} items for conversation ${conversationId}`,
      );
      return { items };
    } catch (error) {
      const errorMsg = toErrorMessage(error);
      this.logger.warn(
        `Failed to get conversation items for ${conversationId}: ${errorMsg}`,
      );
      return { items: [] };
    }
  }

  /**
   * Get fully processed messages for a conversation, ready for frontend rendering.
   *
   * This mirrors the reference ai-virtual-agent's get_conversation_messages():
   * 1. Fetches raw items via the Conversations API
   * 2. Groups tool calls (mcp_call, file_search_call, web_search_call) with
   *    the next assistant message
   * 3. Extracts RAG sources from file_search_call results
   * 4. Drops orphaned tool calls (before user messages or at the end)
   * 5. Returns clean ProcessedMessage[] the frontend can render directly
   */
  async getProcessedMessages(
    conversationId: string,
  ): Promise<ProcessedMessage[]> {
    this.logger.info(
      `Getting processed messages for conversation ${conversationId}`,
    );

    const { items } = await this.getConversationItems(conversationId);
    const messages = processConversationItems(items, this.logger);

    this.logger.info(
      `Processed ${messages.length} messages for conversation ${conversationId}`,
    );
    return messages;
  }

  /**
   * Walk the previous_response_id chain to reconstruct full conversation
   * history. Used as a fallback for legacy responses that lack a
   * conversationId. Returns messages in chronological order.
   *
   * Guards:
   * - Max depth of 50 to prevent infinite loops.
   * - Per-request timeout of 15 s — if the chain is very long and the
   *   upstream server is slow, we return whatever we've collected so far
   *   rather than hanging indefinitely.
   * - Visited-set to break cycles (defensive against bad data).
   */
  async walkResponseChain(
    responseId: string,
  ): Promise<Array<{ role: 'user' | 'assistant'; text: string }>> {
    return walkResponseChainFn(
      responseId,
      id => this.getConversation(id),
      this.logger,
    );
  }

  // extractUserInputFromRaw is now in MessageProcessor.ts

  /**
   * Continue conversation after user approves/rejects a tool call (HITL).
   *
   * Sends a native `mcp_approval_response` input to the Llama Stack
   * Responses API, which either executes the approved tool or records
   * the rejection. The response is linked to the original conversation
   * via `previous_response_id`.
   *
   * Llama Stack may return a *new* `mcp_approval_request` for the same
   * tool due to an internal limitation: when the initial response uses
   * `conversation`, the stored messages omit the assistant's tool-call,
   * causing the LLM to regenerate it with slightly different arguments
   * that don't match the original approval. When the user already
   * approved the tool and the chained request is for the same tool, we
   * automatically re-approve (up to `MAX_AUTO_REAPPROVALS`) to avoid
   * surfacing a redundant dialog.
   */
  async continueAfterApproval(
    responseId: string,
    approvalRequestId: string,
    approved: boolean,
    toolName?: string,
    toolArguments?: string,
    conversationId?: string,
  ): Promise<ApprovalResult> {
    const MAX_AUTO_REAPPROVALS = 3;
    return executeApprovalContinuation(
      {
        clientAccessor: this.clientAccessor,
        mcpAuth: this.mcpAuth,
        mcpServers: this.mcpServers,
        proxyModeEnabled: this.proxyModeEnabled,
        mcpProxy: this.mcpProxy,
        getConversationForResponse: id =>
          this.registry.getConversationForResponse(id),
        registerResponse: (convId, respId) =>
          this.registry.registerResponse(convId, respId),
        logger: this.logger,
      },
      {
        responseId,
        approvalRequestId,
        approved,
        toolName,
        toolArguments,
        conversationId,
        attempt: 0,
        maxAttempts: MAX_AUTO_REAPPROVALS,
      },
    );
  }

  /**
   * Internal method to fetch conversations with a specific limit.
   *
   * Strategy:
   * Llama Stack does NOT return `conversation` or `previous_response_id`
   * in response listings, and we set `store: false` on subsequent turns,
   * so each listed response already represents one unique conversation.
   * We enrich each entry with conversationId from our in-memory registry
   * so the frontend can load full history via the Conversations API.
   */
  private async fetchConversationsWithLimit(
    limit: number,
    order: 'asc' | 'desc',
    after?: string,
  ): Promise<ConversationListResult> {
    const apiResponse = await this.fetchResponsesFromApi(limit, order, after);
    const conversations = await this.enrichResponsesWithConversations(
      apiResponse.data || [],
    );
    this.logger.info(
      `Returning ${
        conversations.length
      } conversations (${this.registry.getRegistrySize()} in registry)`,
    );
    return {
      conversations,
      hasMore: apiResponse.has_more,
      lastId: apiResponse.last_id,
    };
  }

  /** HTTP call to list responses from Llama Stack GET /v1/openai/v1/responses */
  private async fetchResponsesFromApi(
    limit: number,
    order: 'asc' | 'desc',
    after?: string,
  ) {
    return fetchResponsesFromApiFn(
      this.clientAccessor,
      limit,
      order,
      after,
      this.logger,
    );
  }

  /** Enrich API response items with conversationId from the registry */
  private async enrichResponsesWithConversations(
    items: Array<{
      id: string;
      model: string;
      status: string;
      created_at: number;
      input: Array<{
        type: string;
        content?: string | Array<{ type: string; text?: string }>;
        role?: string;
      }>;
      previous_response_id?: string;
      conversation?: string;
    }>,
  ): Promise<ConversationSummary[]> {
    const conversations: ConversationSummary[] = [];

    for (const r of items) {
      if (!r.id) continue;
      const preview = getInputText(r.input) || 'Conversation';
      const registryConvId = await this.registry.getConversationForResponse(
        r.id,
      );
      const summary = toConversationSummary(
        r,
        preview,
        r.conversation || registryConvId,
      );
      if (summary) conversations.push(summary);
    }

    return conversations;
  }

  // getInputText and extractContentFromItem are now in MessageProcessor.ts
}
