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
import type { LoggerService } from '@backstage/backend-plugin-api';
import type { LlamaStackClient } from './LlamaStackClient';
import type { McpAuthService } from './McpAuthService';
import type { ConversationService } from './ConversationService';
import { MESSAGE_PREVIEW_MAX_LENGTH } from '../../constants';
import type {
  ChatRequest,
  ChatResponse,
  EffectiveConfig,
  MCPServerConfig,
  ResponsesApiMcpTool,
  ResponsesApiResponse,
  ResponsesApiTool,
} from '../../types';
import type { McpProxyService } from './McpProxyService';
import { toErrorMessage } from '../../services/utils';
import { buildTools as buildToolsImpl } from './ToolsBuilder';

function formatHeaderSummary(hdrs: Record<string, string> | undefined): string {
  if (hdrs && Object.keys(hdrs).length > 0) {
    return `[${Object.keys(hdrs).length} header(s), no Auth]`;
  }
  return '[NONE]';
}

const MAX_BUFFERED_EVENTS = 5_000;
import { processResponse as processResponseImpl } from './ResponseProcessor';

/**
 * Dependencies injected into every ChatService call.
 * These are resolved per-request by the orchestrator so that
 * runtime config changes take effect immediately.
 */
export interface ChatDeps {
  client: LlamaStackClient;
  config: EffectiveConfig;
  mcpServers: MCPServerConfig[];
  mcpAuth: McpAuthService | null;
  conversations: ConversationService | null;
  /** MCP namespacing proxy instance (used when conflicts detected). */
  mcpProxy?: McpProxyService;
  /** Whether proxy mode is active (tool name conflicts exist). */
  proxyModeEnabled?: boolean;
}

/**
 * Stateless chat service extracted from LlamaStackOrchestrator.
 *
 * Every public method receives its dependencies explicitly —
 * nothing is cached on the instance except the logger.
 * This makes the service safe for runtime config changes:
 * a new EffectiveConfig or LlamaStackClient can be passed
 * per-request without restarting the plugin.
 */
export class ChatService {
  private readonly logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Send a chat message and return a complete response.
   */
  async chat(request: ChatRequest, deps: ChatDeps): Promise<ChatResponse> {
    const { client, config } = deps;
    const { userInput, fullInstructions, storeOverride, tools } =
      await this.prepareChatContext(request, deps);

    const responsesRequest = this.buildResponsesRequest(
      userInput,
      fullInstructions,
      tools,
      config,
      {
        previousResponseId: request.previousResponseId,
        conversationId: request.conversationId,
        storeOverride,
      },
    );

    this.logger.info('Sending chat request to Llama Stack Responses API', {
      model: config.model,
      toolCount: tools.length,
    });

    const response = await client.request<ResponsesApiResponse>(
      '/v1/openai/v1/responses',
      {
        method: 'POST',
        body: JSON.stringify(responsesRequest),
      },
    );

    const chatResponse = processResponseImpl(response);

    if (request.conversationId && response.id && deps.conversations) {
      await deps.conversations.registerResponse(
        request.conversationId,
        response.id,
      );
    }

    return chatResponse;
  }

  /**
   * Stream a chat message with real-time SSE events.
   */
  async chatStream(
    request: ChatRequest,
    onEvent: (event: string) => void,
    deps: ChatDeps,
    signal?: AbortSignal,
  ): Promise<void> {
    const { client, config } = deps;
    const { userInput, fullInstructions, storeOverride, tools } =
      await this.prepareChatContext(request, deps, '[Stream] ');

    const mcpTools = tools.filter(
      (t): t is ResponsesApiMcpTool => t.type === 'mcp',
    );
    if (mcpTools.length > 0) {
      const redacted = mcpTools.map(t => {
        const hdrs = t.headers;
        const hasAuth = !!hdrs?.Authorization;
        return {
          type: t.type,
          server_label: t.server_label,
          server_url: t.server_url,
          require_approval: t.require_approval,
          headers: hasAuth
            ? `[AUTH present, length=${hdrs!.Authorization.length}]`
            : formatHeaderSummary(hdrs),
        };
      });
      this.logger.info(
        `[Stream] Sending ${
          mcpTools.length
        } MCP tools to Llama Stack: ${JSON.stringify(redacted)}`,
      );
    }

    // HITL requires `store: true` so the response is persisted and findable
    // by `previous_response_id` in the approval continuation request.
    const hasHitlTools = mcpTools.some(
      t => t.require_approval && t.require_approval !== 'never',
    );
    const effectiveStoreOverride = hasHitlTools ? true : storeOverride;

    const executeStream = async (
      streamTools: ResponsesApiTool[],
      eventSink: (eventData: string) => void,
    ): Promise<{ capturedResponseId?: string }> => {
      const responsesRequest = this.buildResponsesRequest(
        userInput,
        fullInstructions,
        streamTools,
        config,
        {
          stream: true,
          previousResponseId: request.previousResponseId,
          conversationId: request.conversationId,
          storeOverride: effectiveStoreOverride,
        },
      );

      this.logger.info('Starting streaming chat request', {
        model: config.model,
        toolCount: streamTools.length,
        toolChoice: config.toolChoice,
        parallelToolCalls: config.parallelToolCalls,
        hasTextFormat: !!config.textFormat,
        conversationId: request.conversationId || 'none',
        store: effectiveStoreOverride ?? !config.zdrMode,
      });

      let capturedResponseId: string | undefined;
      const wrappedOnEvent = (eventData: string) => {
        if (!capturedResponseId) {
          try {
            const parsed = JSON.parse(eventData);
            if (parsed.type === 'response.created' && parsed.response?.id) {
              capturedResponseId = parsed.response.id;
            }
          } catch (error) {
            this.logger.debug(
              'Tool arguments are not valid JSON, using raw string',
              error,
            );
          }
        }
        eventSink(eventData);
      };

      await client.streamRequest(
        '/v1/openai/v1/responses',
        responsesRequest,
        wrappedOnEvent,
        signal,
      );

      return { capturedResponseId };
    };

    const hasMcpTools = mcpTools.length > 0;
    let capturedResponseId: string | undefined;

    if (hasMcpTools) {
      const bufferedEvents: string[] = [];
      let hasContentEvents = false;
      let isAuthError = false;

      const bufferingSink = (eventData: string) => {
        if (bufferedEvents.length >= MAX_BUFFERED_EVENTS) {
          bufferedEvents.shift();
          this.logger.warn(
            `Buffered events exceeded ${MAX_BUFFERED_EVENTS}, dropping oldest event`,
          );
        }
        bufferedEvents.push(eventData);
        try {
          const parsed = JSON.parse(eventData);
          const t = parsed.type as string;
          if (
            t === 'response.created' ||
            t === 'response.output_text.delta' ||
            t === 'response.reasoning_text.delta' ||
            t === 'response.output_item.added' ||
            t === 'response.mcp_call.in_progress' ||
            t === 'response.mcp_call.requires_approval' ||
            t === 'response.completed'
          ) {
            hasContentEvents = true;
          }
        } catch (error) {
          this.logger.debug('Response content is not JSON', error);
        }
      };

      try {
        const result = await executeStream(tools, bufferingSink);
        capturedResponseId = result.capturedResponseId;
      } catch (error) {
        const errorMsg = toErrorMessage(error);
        const lowerMsg = errorMsg.toLowerCase();
        isAuthError =
          lowerMsg.includes('401') ||
          lowerMsg.includes('403') ||
          lowerMsg.includes('unauthorized') ||
          lowerMsg.includes('forbidden');

        this.logger.warn(`Stream request failed with MCP tools: ${errorMsg}`);
        if (isAuthError) {
          this.logger.error(
            'MCP stream failed due to authentication error — not retrying without MCP tools',
          );
        }
      }

      if (hasContentEvents) {
        for (const evt of bufferedEvents) {
          onEvent(evt);
        }
      } else if (isAuthError) {
        if (bufferedEvents.length > 0) {
          for (const evt of bufferedEvents) {
            onEvent(evt);
          }
        } else {
          onEvent(
            JSON.stringify({
              type: 'response.output_text.delta',
              delta: `⚠️ MCP tool connection failed due to an authentication error. Please check MCP server auth configuration.`,
            }),
          );
          onEvent(JSON.stringify({ type: 'response.completed' }));
        }
      } else {
        this.logger.warn(
          'Stream produced no content with MCP tools. Retrying without MCP tools (graceful degradation).',
        );
        const nonMcpTools = tools.filter(t => t.type !== 'mcp');
        const result = await executeStream(nonMcpTools, onEvent);
        capturedResponseId = result.capturedResponseId;
      }
    } else {
      const result = await executeStream(tools, onEvent);
      capturedResponseId = result.capturedResponseId;
    }

    if (request.conversationId && capturedResponseId && deps.conversations) {
      await deps.conversations.registerResponse(
        request.conversationId,
        capturedResponseId,
      );
    }

    this.logger.info('Streaming chat completed');
  }

  // ===========================================================================
  // Internal Helpers
  // ===========================================================================

  private async prepareChatContext(
    request: ChatRequest,
    deps: ChatDeps,
    logPrefix = '',
  ): Promise<{
    userInput: string;
    fullInstructions: string;
    storeOverride: boolean | undefined;
    tools: ResponsesApiTool[];
  }> {
    const { config } = deps;

    const enableRAG = request.enableRAG !== false;
    const userInput = this.extractUserInput(request);
    const conversationContext = this.buildConversationContext(
      request,
      userInput,
    );
    const fullInstructions = config.systemPrompt + conversationContext;

    let storeOverride: boolean | undefined;
    if (request.conversationId && deps.conversations) {
      const isFirst = deps.conversations.markFirstStoredTurn(
        request.conversationId,
      );
      storeOverride = isFirst;
    }

    const tools = await buildToolsImpl(enableRAG, deps, this.logger, logPrefix);

    // Check user input against admin-configured safety patterns
    this.checkSafetyPatterns(userInput, config.safetyPatterns, logPrefix);

    return { userInput, fullInstructions, storeOverride, tools };
  }

  /**
   * Check user input against configured destructive action patterns.
   * Logs a warning when a match is found so administrators can monitor.
   */
  private checkSafetyPatterns(
    userInput: string,
    patterns: string[] | undefined,
    logPrefix: string,
  ): void {
    if (!patterns || patterns.length === 0) return;
    const lower = userInput.toLowerCase();
    const matched = patterns.filter(p => lower.includes(p.toLowerCase()));
    if (matched.length > 0) {
      this.logger.warn(
        `${logPrefix}User input matched safety pattern(s): ${matched.join(
          ', ',
        )}`,
      );
    }
  }

  private extractUserInput(request: ChatRequest): string {
    const lastUserMessage = [...request.messages]
      .reverse()
      .find(m => m.role === 'user');

    if (!lastUserMessage) {
      throw new Error('No user message found in request');
    }

    return lastUserMessage.content;
  }

  private buildConversationContext(
    request: ChatRequest,
    userInput: string,
  ): string {
    const hasNativeContext =
      !!request.previousResponseId || !!request.conversationId;

    if (hasNativeContext || request.messages.length <= 1) {
      return '';
    }

    const historyMessages = request.messages
      .slice(0, -1)
      .filter(m => m.role !== 'system');

    if (historyMessages.length === 0) {
      return '';
    }

    const historyParts = historyMessages.map(m => {
      const role = m.role === 'user' ? 'User' : 'Assistant';
      const content = m.content
        .replace(/[\n\r]/g, ' ')
        .substring(0, MESSAGE_PREVIEW_MAX_LENGTH);
      return `${role} said: ${content}`;
    });

    const sanitizedInput = userInput.replace(/[\n\r]/g, ' ');
    return ` CONVERSATION CONTEXT: This is a follow-up. Previous: ${historyParts.join(
      ' | ',
    )} | User now says: ${sanitizedInput}`;
  }

  /**
   * Build the Responses API request body from resolved config.
   */
  private buildResponsesRequest(
    userInput: string,
    instructions: string,
    tools: ResponsesApiTool[],
    config: EffectiveConfig,
    options: {
      stream?: boolean;
      previousResponseId?: string;
      conversationId?: string;
      storeOverride?: boolean;
    } = {},
  ): Record<string, unknown> {
    const isZdrMode = config.zdrMode === true;
    const includeFields = isZdrMode
      ? ['file_search_call.results', 'reasoning.encrypted_content']
      : ['file_search_call.results'];

    const storeValue =
      options.storeOverride !== undefined ? options.storeOverride : !isZdrMode;

    const request: Record<string, unknown> = {
      input: userInput,
      model: config.model,
      instructions,
      tools: tools.length > 0 ? tools : undefined,
      store: storeValue,
      include: includeFields,
    };

    if (options.stream) {
      request.stream = true;
    }

    if (config.toolChoice) {
      request.tool_choice = config.toolChoice;
    }

    if (config.parallelToolCalls !== undefined) {
      request.parallel_tool_calls = config.parallelToolCalls;
    }

    if (config.textFormat) {
      request.text = { format: config.textFormat };
    }

    if (config.reasoning) {
      const reasoning: Record<string, unknown> = {};
      if (config.reasoning.effort) reasoning.effort = config.reasoning.effort;
      if (config.reasoning.summary)
        reasoning.summary = config.reasoning.summary;
      if (Object.keys(reasoning).length > 0) {
        request.reasoning = reasoning;
      }
    }

    if (options.conversationId) {
      request.conversation = options.conversationId;
    } else if (options.previousResponseId) {
      request.previous_response_id = options.previousResponseId;
    }

    return request;
  }
}
