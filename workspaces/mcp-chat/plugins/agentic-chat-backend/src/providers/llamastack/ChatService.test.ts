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
import type {
  EffectiveConfig,
  ChatRequest,
  ResponsesApiResponse,
  MCPServerConfig,
  ResponsesApiMessage,
  ResponsesApiFileSearchResult,
  ResponsesApiMcpCall,
} from '../../types';
import { ChatService, ChatDeps } from './ChatService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockLogger(): Record<string, jest.Mock> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
}

function createBaseConfig(
  overrides: Partial<EffectiveConfig> = {},
): EffectiveConfig {
  return {
    model: 'test-model',
    baseUrl: 'http://localhost:8321',
    systemPrompt: 'You are a helpful assistant.',
    enableWebSearch: false,
    enableCodeInterpreter: false,
    vectorStoreIds: [],
    vectorStoreName: 'default',
    embeddingModel: 'all-MiniLM-L6-v2',
    embeddingDimension: 384,
    chunkingStrategy: 'auto',
    maxChunkSizeTokens: 800,
    chunkOverlapTokens: 400,
    skipTlsVerify: false,
    zdrMode: false,
    verboseStreamLogging: false,
    ...overrides,
  };
}

function createMockClient(): jest.Mocked<
  Pick<LlamaStackClient, 'request' | 'streamRequest'>
> {
  return {
    request: jest.fn(),
    streamRequest: jest.fn(),
  };
}

function createMockConversations(): jest.Mocked<
  Pick<ConversationService, 'markFirstStoredTurn' | 'registerResponse'>
> {
  return {
    markFirstStoredTurn: jest.fn().mockReturnValue(true),
    registerResponse: jest.fn().mockResolvedValue(undefined),
  };
}

function createMockMcpAuth(): jest.Mocked<
  Pick<McpAuthService, 'getApiApprovalConfig' | 'getServerHeaders'>
> {
  return {
    getApiApprovalConfig: jest.fn().mockReturnValue('never'),
    getServerHeaders: jest.fn().mockResolvedValue({}),
  };
}

function simpleChatRequest(content = 'Hello'): ChatRequest {
  return {
    messages: [{ role: 'user', content }],
  };
}

function createMessageOutput(text: string): ResponsesApiMessage {
  return {
    type: 'message',
    id: 'msg-1',
    role: 'assistant',
    status: 'completed',
    content: [{ type: 'output_text', text }],
  };
}

function simpleApiResponse(text = 'Hi there'): ResponsesApiResponse {
  return {
    id: 'resp-1',
    object: 'response',
    created_at: Date.now(),
    model: 'test-model',
    status: 'completed',
    output: [createMessageOutput(text)],
    usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChatService', () => {
  let service: ChatService;
  let mockLogger: Record<string, jest.Mock>;
  let mockClient: ReturnType<typeof createMockClient>;
  let deps: ChatDeps;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = createMockLogger();
    mockClient = createMockClient();
    service = new ChatService(mockLogger as unknown as LoggerService);
    deps = {
      client: mockClient as unknown as LlamaStackClient,
      config: createBaseConfig(),
      mcpServers: [],
      mcpAuth: null,
      conversations: null,
    };
  });

  // =========================================================================
  // chat() — non-streaming
  // =========================================================================

  describe('chat()', () => {
    it('sends a basic request and returns parsed response', async () => {
      mockClient.request.mockResolvedValue(simpleApiResponse('Hello back!'));

      const result = await service.chat(simpleChatRequest('Hi'), deps);

      expect(result.role).toBe('assistant');
      expect(result.content).toBe('Hello back!');
      expect(result.responseId).toBe('resp-1');
      expect(mockClient.request).toHaveBeenCalledTimes(1);

      const [endpoint, opts] = mockClient.request.mock.calls[0]!;
      expect(endpoint).toBe('/v1/openai/v1/responses');
      const body = JSON.parse(opts!.body as string);
      expect(body.model).toBe('test-model');
      expect(body.input).toBe('Hi');
      expect(body.instructions).toContain('You are a helpful assistant.');
    });

    it('throws when no user message is present', async () => {
      const request: ChatRequest = {
        messages: [{ role: 'system' as const, content: 'system only' }],
      };
      await expect(service.chat(request, deps)).rejects.toThrow(
        'No user message found in request',
      );
    });

    it('uses the model and toolChoice from config', async () => {
      deps.config = createBaseConfig({
        model: 'custom-model',
        toolChoice: 'required',
      });
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(simpleChatRequest(), deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.model).toBe('custom-model');
      expect(body.tool_choice).toBe('required');
    });

    it('includes parallelToolCalls and textFormat when configured', async () => {
      deps.config = createBaseConfig({
        parallelToolCalls: true,
        textFormat: {
          type: 'json_schema',
          json_schema: { name: 'test', schema: { type: 'object' } },
        },
      });
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(simpleChatRequest(), deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.parallel_tool_calls).toBe(true);
      expect(body.text).toEqual({
        format: deps.config.textFormat,
      });
    });

    it('includes previous_response_id when no conversationId', async () => {
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(
        { ...simpleChatRequest(), previousResponseId: 'prev-1' },
        deps,
      );

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.previous_response_id).toBe('prev-1');
      expect(body.conversation).toBeUndefined();
    });

    it('uses conversation instead of previous_response_id when conversationId is set', async () => {
      const conversations = createMockConversations();
      deps.conversations = conversations as unknown as ConversationService;
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(
        {
          ...simpleChatRequest(),
          conversationId: 'conv-1',
          previousResponseId: 'prev-1',
        },
        deps,
      );

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.conversation).toBe('conv-1');
      expect(body.previous_response_id).toBeUndefined();
    });

    it('registers response with ConversationService', async () => {
      const conversations = createMockConversations();
      deps.conversations = conversations as unknown as ConversationService;
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(
        { ...simpleChatRequest(), conversationId: 'conv-1' },
        deps,
      );

      expect(conversations.registerResponse).toHaveBeenCalledWith(
        'conv-1',
        'resp-1',
      );
    });

    it('sets store based on markFirstStoredTurn', async () => {
      const conversations = createMockConversations();
      conversations.markFirstStoredTurn.mockReturnValue(false);
      deps.conversations = conversations as unknown as ConversationService;
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(
        { ...simpleChatRequest(), conversationId: 'conv-1' },
        deps,
      );

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.store).toBe(false);
    });

    it('sets store to false in ZDR mode', async () => {
      deps.config = createBaseConfig({ zdrMode: true });
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(simpleChatRequest(), deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.store).toBe(false);
      expect(body.include).toContain('reasoning.encrypted_content');
    });

    it('returns fallback content when response has no text', async () => {
      mockClient.request.mockResolvedValue({
        ...simpleApiResponse(),
        output: [],
      });

      const result = await service.chat(simpleChatRequest(), deps);
      expect(result.content).toBe('I could not generate a response.');
    });
  });

  // =========================================================================
  // chat() — RAG / file_search
  // =========================================================================

  describe('chat() with RAG', () => {
    it('includes file_search tool when vectorStoreIds are configured', async () => {
      deps.config = createBaseConfig({
        vectorStoreIds: ['vs-1', 'vs-2'],
        fileSearchMaxResults: 5,
        fileSearchScoreThreshold: 0.7,
      });
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(simpleChatRequest(), deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      const fsTools = body.tools.filter(
        (t: { type: string }) => t.type === 'file_search',
      );
      expect(fsTools).toHaveLength(1);
      expect(fsTools[0].vector_store_ids).toEqual(['vs-1', 'vs-2']);
      expect(fsTools[0].max_num_results).toBe(5);
      expect(fsTools[0].ranking_options.score_threshold).toBe(0.7);
    });

    it('omits file_search when enableRAG is false', async () => {
      deps.config = createBaseConfig({ vectorStoreIds: ['vs-1'] });
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat({ ...simpleChatRequest(), enableRAG: false }, deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.tools).toBeUndefined();
    });

    it('extracts and deduplicates RAG sources from file_search_call results', async () => {
      const fileSearchResult: ResponsesApiFileSearchResult = {
        type: 'file_search_call',
        id: 'fs-1',
        status: 'completed',
        queries: ['query'],
        results: [
          {
            file_id: 'f1',
            filename: 'doc.pdf',
            score: 0.9,
            text: 'chunk1',
            attributes: {
              source_url: 'http://example.com/doc',
              title: 'Doc Title',
            },
          },
          {
            file_id: 'f2',
            filename: 'doc2.pdf',
            score: 0.8,
            text: 'chunk2',
            attributes: { source_url: 'http://example.com/doc' },
          },
        ],
      };
      const response: ResponsesApiResponse = {
        ...simpleApiResponse(),
        output: [fileSearchResult, createMessageOutput('Answer')],
      };
      mockClient.request.mockResolvedValue(response);

      const result = await service.chat(simpleChatRequest(), deps);

      expect(result.ragSources).toHaveLength(1);
      expect(result.ragSources![0].title).toBe('Doc Title');
    });
  });

  // =========================================================================
  // chat() — MCP tools
  // =========================================================================

  describe('chat() with MCP tools', () => {
    it('includes MCP servers as tools with auth headers', async () => {
      const mcpAuth = createMockMcpAuth();
      mcpAuth.getServerHeaders.mockResolvedValue({
        Authorization: 'Bearer token123',
      });
      deps.mcpAuth = mcpAuth as unknown as McpAuthService;

      const server: MCPServerConfig = {
        id: 'test-mcp',
        name: 'Test MCP',
        type: 'streamable-http',
        url: 'http://mcp.example.com',
        requireApproval: 'always',
      };
      deps.mcpServers = [server];
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(simpleChatRequest(), deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      const mcpTools = body.tools.filter(
        (t: { type: string }) => t.type === 'mcp',
      );
      expect(mcpTools).toHaveLength(1);
      expect(mcpTools[0].server_url).toBe('http://mcp.example.com');
      expect(mcpTools[0].headers.Authorization).toBe('Bearer token123');
    });

    it('skips MCP servers when mcpAuth is null', async () => {
      deps.mcpAuth = null;
      deps.mcpServers = [
        {
          id: 'skip-me',
          name: 'Skip',
          type: 'streamable-http',
          url: 'http://skip.example.com',
        },
      ];
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(simpleChatRequest(), deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.tools).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('McpAuthService not initialized'),
      );
    });

    it('extracts tool call info from mcp_call output items', async () => {
      const mcpCall: ResponsesApiMcpCall = {
        type: 'mcp_call',
        id: 'tc-1',
        name: 'list_pods',
        server_label: 'k8s',
        arguments: '{"namespace":"default"}',
        output: '["pod-a","pod-b"]',
      };
      const response: ResponsesApiResponse = {
        ...simpleApiResponse(),
        output: [mcpCall, createMessageOutput('Found pods')],
      };
      mockClient.request.mockResolvedValue(response);

      const result = await service.chat(simpleChatRequest(), deps);

      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls![0].name).toBe('list_pods');
      expect(result.toolCalls![0].serverLabel).toBe('k8s');
    });
  });

  // =========================================================================
  // chat() — built-in tools (web_search, code_interpreter, functions)
  // =========================================================================

  describe('chat() with built-in tools', () => {
    it('adds web_search and code_interpreter tools when enabled', async () => {
      deps.config = createBaseConfig({
        enableWebSearch: true,
        enableCodeInterpreter: true,
      });
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(simpleChatRequest(), deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      const types = body.tools.map((t: { type: string }) => t.type);
      expect(types).toContain('web_search');
      expect(types).toContain('code_interpreter');
    });

    it('includes custom function definitions', async () => {
      deps.config = createBaseConfig({
        functions: [
          {
            name: 'getWeather',
            description: 'Get weather info',
            parameters: { type: 'object', properties: {} },
          },
        ],
      });
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(simpleChatRequest(), deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      const funcTools = body.tools.filter(
        (t: { type: string }) => t.type === 'function',
      );
      expect(funcTools).toHaveLength(1);
      expect(funcTools[0].name).toBe('getWeather');
      expect(funcTools[0].strict).toBe(true);
    });
  });

  // =========================================================================
  // chat() — conversation context
  // =========================================================================

  describe('chat() with conversation context', () => {
    it('builds conversation context for multi-message requests without native context', async () => {
      mockClient.request.mockResolvedValue(simpleApiResponse());

      const request: ChatRequest = {
        messages: [
          { role: 'user', content: 'What is Backstage?' },
          { role: 'assistant', content: 'Backstage is a platform.' },
          { role: 'user', content: 'Tell me more' },
        ],
      };

      await service.chat(request, deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.instructions).toContain('CONVERSATION CONTEXT');
      expect(body.instructions).toContain('What is Backstage?');
      expect(body.instructions).toContain('Tell me more');
    });

    it('skips conversation context when conversationId is set', async () => {
      const conversations = createMockConversations();
      deps.conversations = conversations as unknown as ConversationService;
      mockClient.request.mockResolvedValue(simpleApiResponse());

      const request: ChatRequest = {
        messages: [
          { role: 'user', content: 'First' },
          { role: 'user', content: 'Second' },
        ],
        conversationId: 'conv-1',
      };

      await service.chat(request, deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.instructions).not.toContain('CONVERSATION CONTEXT');
    });

    it('skips conversation context for single-message requests', async () => {
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(simpleChatRequest(), deps);

      const body = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      expect(body.instructions).not.toContain('CONVERSATION CONTEXT');
    });
  });

  // =========================================================================
  // chatStream()
  // =========================================================================

  describe('chatStream()', () => {
    it('streams events directly when no MCP tools are present', async () => {
      mockClient.streamRequest.mockImplementation(
        async (_endpoint, _body, onEvent) => {
          onEvent(
            JSON.stringify({
              type: 'response.created',
              response: { id: 'resp-s1' },
            }),
          );
          onEvent(
            JSON.stringify({
              type: 'response.output_text.delta',
              delta: 'Hello',
            }),
          );
          onEvent(JSON.stringify({ type: 'response.completed' }));
        },
      );

      const events: string[] = [];
      await service.chatStream(
        simpleChatRequest(),
        evt => events.push(evt),
        deps,
      );

      expect(events).toHaveLength(3);
      expect(JSON.parse(events[0]).type).toBe('response.created');
    });

    it('buffers and flushes events when MCP tools succeed', async () => {
      const mcpAuth = createMockMcpAuth();
      deps.mcpAuth = mcpAuth as unknown as McpAuthService;
      deps.mcpServers = [
        {
          id: 'mcp-1',
          name: 'MCP 1',
          type: 'streamable-http',
          url: 'http://mcp.local',
        },
      ];

      mockClient.streamRequest.mockImplementation(
        async (_endpoint, _body, onEvent) => {
          onEvent(
            JSON.stringify({
              type: 'response.output_text.delta',
              delta: 'text',
            }),
          );
          onEvent(JSON.stringify({ type: 'response.completed' }));
        },
      );

      const events: string[] = [];
      await service.chatStream(
        simpleChatRequest(),
        evt => events.push(evt),
        deps,
      );

      expect(events).toHaveLength(2);
    });

    it('retries without MCP tools when initial stream fails', async () => {
      const mcpAuth = createMockMcpAuth();
      deps.mcpAuth = mcpAuth as unknown as McpAuthService;
      deps.mcpServers = [
        {
          id: 'mcp-1',
          name: 'MCP 1',
          type: 'streamable-http',
          url: 'http://mcp.local',
        },
      ];

      let callCount = 0;
      mockClient.streamRequest.mockImplementation(
        async (_endpoint, body, onEvent) => {
          callCount++;
          const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
          const hasMcp = parsedBody.tools?.some(
            (t: { type: string }) => t.type === 'mcp',
          );
          if (hasMcp) {
            throw new Error('MCP server unreachable');
          }
          onEvent(
            JSON.stringify({
              type: 'response.output_text.delta',
              delta: 'fallback',
            }),
          );
          onEvent(JSON.stringify({ type: 'response.completed' }));
        },
      );

      const events: string[] = [];
      await service.chatStream(
        simpleChatRequest(),
        evt => events.push(evt),
        deps,
      );

      expect(callCount).toBe(2);
      expect(events).toHaveLength(2);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Stream request failed with MCP tools'),
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Retrying without MCP tools (graceful degradation)',
        ),
      );
    });

    it('registers conversation response for streaming', async () => {
      const conversations = createMockConversations();
      deps.conversations = conversations as unknown as ConversationService;

      mockClient.streamRequest.mockImplementation(
        async (_endpoint, _body, onEvent) => {
          onEvent(
            JSON.stringify({
              type: 'response.created',
              response: { id: 'resp-stream-1' },
            }),
          );
          onEvent(
            JSON.stringify({
              type: 'response.output_text.delta',
              delta: 'hi',
            }),
          );
        },
      );

      await service.chatStream(
        { ...simpleChatRequest(), conversationId: 'conv-2' },
        () => {},
        deps,
      );

      expect(conversations.registerResponse).toHaveBeenCalledWith(
        'conv-2',
        'resp-stream-1',
      );
    });
  });

  // =========================================================================
  // Statelessness — different configs per call
  // =========================================================================

  describe('statelessness', () => {
    it('uses different configs for consecutive calls', async () => {
      mockClient.request.mockResolvedValue(simpleApiResponse());

      const deps1: ChatDeps = {
        ...deps,
        config: createBaseConfig({ model: 'model-A' }),
      };
      const deps2: ChatDeps = {
        ...deps,
        config: createBaseConfig({ model: 'model-B' }),
      };

      await service.chat(simpleChatRequest(), deps1);
      await service.chat(simpleChatRequest(), deps2);

      const body1 = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      const body2 = JSON.parse(
        (mockClient.request.mock.calls[1]![1] as { body: string }).body,
      );
      expect(body1.model).toBe('model-A');
      expect(body2.model).toBe('model-B');
    });

    it('uses different system prompts per call', async () => {
      mockClient.request.mockResolvedValue(simpleApiResponse());

      const deps1: ChatDeps = {
        ...deps,
        config: createBaseConfig({ systemPrompt: 'Prompt A' }),
      };
      const deps2: ChatDeps = {
        ...deps,
        config: createBaseConfig({ systemPrompt: 'Prompt B' }),
      };

      await service.chat(simpleChatRequest(), deps1);
      await service.chat(simpleChatRequest(), deps2);

      const body1 = JSON.parse(
        (mockClient.request.mock.calls[0]![1] as { body: string }).body,
      );
      const body2 = JSON.parse(
        (mockClient.request.mock.calls[1]![1] as { body: string }).body,
      );
      expect(body1.instructions).toContain('Prompt A');
      expect(body2.instructions).toContain('Prompt B');
    });
  });

  // ===========================================================================
  // Safety pattern detection
  // ===========================================================================

  describe('safety patterns', () => {
    it('logs a warning when user input matches a safety pattern', async () => {
      mockClient.request.mockResolvedValue(simpleApiResponse());

      const patternDeps: ChatDeps = {
        ...deps,
        config: createBaseConfig({
          safetyPatterns: ['delete', 'drop', 'destroy'],
        }),
      };

      await service.chat(
        simpleChatRequest('Please delete all records'),
        patternDeps,
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('safety pattern'),
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('delete'),
      );
    });

    it('does not log when no patterns match', async () => {
      mockClient.request.mockResolvedValue(simpleApiResponse());

      const patternDeps: ChatDeps = {
        ...deps,
        config: createBaseConfig({
          safetyPatterns: ['delete', 'drop'],
        }),
      };

      await service.chat(simpleChatRequest('List all items'), patternDeps);

      const warnCalls = mockLogger.warn.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === 'string' && call[0].includes('safety pattern'),
      );
      expect(warnCalls).toHaveLength(0);
    });

    it('does not log when safetyPatterns is undefined', async () => {
      mockClient.request.mockResolvedValue(simpleApiResponse());

      await service.chat(simpleChatRequest('Delete everything'), deps);

      const warnCalls = mockLogger.warn.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === 'string' && call[0].includes('safety pattern'),
      );
      expect(warnCalls).toHaveLength(0);
    });

    it('matches patterns case-insensitively', async () => {
      mockClient.request.mockResolvedValue(simpleApiResponse());

      const patternDeps: ChatDeps = {
        ...deps,
        config: createBaseConfig({
          safetyPatterns: ['DELETE'],
        }),
      };

      await service.chat(simpleChatRequest('please delete this'), patternDeps);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('safety pattern'),
      );
    });
  });
});
