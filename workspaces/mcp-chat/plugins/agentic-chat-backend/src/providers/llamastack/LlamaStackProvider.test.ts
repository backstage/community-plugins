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

import { createMockLogger } from '../../test-utils';
import type { NormalizedStreamEvent } from '../types';

const mockVectorStoreFacade = {
  listDocuments: jest.fn().mockResolvedValue([]),
  listVectorStores: jest.fn().mockResolvedValue([]),
  getDefaultVectorStoreId: jest.fn().mockReturnValue('vs-1'),
  getActiveVectorStoreIds: jest.fn().mockResolvedValue(['vs-1']),
  syncDocuments: jest.fn().mockResolvedValue({
    added: 0,
    updated: 0,
    removed: 0,
    failed: 0,
    unchanged: 0,
    errors: [] as string[],
  }),
  uploadDocument: jest.fn().mockResolvedValue({
    fileId: 'f1',
    fileName: 'f1.txt',
    status: 'completed',
  }),
  deleteDocument: jest.fn().mockResolvedValue({ success: true }),
  searchVectorStore: jest.fn().mockResolvedValue({
    query: '',
    chunks: [],
    vectorStoreId: 'vs-1',
    totalResults: 0,
  }),
  getVectorStoreConfig: jest.fn().mockResolvedValue(null),
  createVectorStoreWithConfig: jest.fn().mockResolvedValue({
    vectorStoreId: 'vs-1',
    vectorStoreName: 'store',
    created: true,
    embeddingModel: 'model',
    embeddingDimension: 384,
  }),
  getVectorStoreStatus: jest.fn().mockResolvedValue({
    exists: true,
    vectorStoreId: 'vs-1',
    ready: true,
  }),
  addVectorStoreId: jest.fn(),
  removeVectorStoreId: jest.fn(),
  deleteVectorStore: jest.fn().mockResolvedValue(undefined),
  getSyncSchedule: jest.fn().mockReturnValue(undefined),
};

const mockConversationFacade = {
  createConversation: jest.fn().mockResolvedValue('conv-1'),
  listConversations: jest
    .fn()
    .mockResolvedValue({ conversations: [], nextCursor: undefined }),
  getConversation: jest.fn().mockResolvedValue(null),
  getConversationInputs: jest.fn().mockResolvedValue({ items: [] }),
  walkResponseChain: jest.fn().mockResolvedValue([]),
  getProcessedMessages: jest.fn().mockResolvedValue([]),
  deleteConversation: jest.fn().mockResolvedValue(undefined),
  continueAfterApproval: jest
    .fn()
    .mockResolvedValue({ responseId: 'r1', output: [] }),
};

const mockOrchestrator = {
  initialize: jest.fn().mockResolvedValue(undefined),
  postInitialize: jest.fn().mockResolvedValue(undefined),
  invalidateRuntimeConfig: jest.fn(),
  getResolver: jest.fn().mockReturnValue(null),
  getClientManager: jest.fn().mockReturnValue({
    getExistingClient: jest.fn().mockReturnValue({
      request: jest.fn().mockResolvedValue({ data: [], output: [] }),
    }),
  }),
  getVectorStoreFacade: jest.fn().mockReturnValue(mockVectorStoreFacade),
  getConversationFacade: jest.fn().mockReturnValue(mockConversationFacade),
  getStatus: jest.fn().mockResolvedValue({ ready: true }),
  chat: jest.fn().mockResolvedValue({ responseId: 'r1', output: [] }),
  chatStream: jest.fn().mockResolvedValue(undefined),
  handleMcpProxyRequest: jest.fn(),
};

const mockSafetyService = {
  initialize: jest.fn().mockResolvedValue(undefined),
  isEnabled: jest.fn().mockReturnValue(true),
  getAvailableShields: jest.fn().mockReturnValue([{ identifier: 'shield1' }]),
  checkInput: jest.fn().mockResolvedValue(null),
  checkOutput: jest.fn().mockResolvedValue(null),
  applyDynamicOverrides: jest.fn(),
};

const mockEvaluationService = {
  initialize: jest.fn().mockResolvedValue(undefined),
  isEnabled: jest.fn().mockReturnValue(true),
  getAvailableScoringFunctions: jest
    .fn()
    .mockReturnValue([{ identifier: 'score1' }]),
  scoreResponse: jest.fn().mockResolvedValue(null),
  applyDynamicOverrides: jest.fn(),
};

jest.mock('./LlamaStackOrchestrator', () => ({
  LlamaStackOrchestrator: jest.fn().mockImplementation(() => mockOrchestrator),
}));

jest.mock('./SafetyService', () => ({
  SafetyService: jest.fn().mockImplementation(() => mockSafetyService),
}));

jest.mock('./EvaluationService', () => ({
  EvaluationService: jest.fn().mockImplementation(() => mockEvaluationService),
}));

import { LlamaStackProvider } from './LlamaStackProvider';

function createProvider(
  overrides: {
    logger?: ReturnType<typeof createMockLogger>;
    config?: unknown;
    database?: unknown;
    adminConfig?: unknown;
  } = {},
) {
  const logger = overrides.logger ?? createMockLogger();
  return new LlamaStackProvider({
    logger,
    config: (overrides.config ??
      {}) as import('@backstage/backend-plugin-api').RootConfigService,
    database: overrides.database as
      | import('@backstage/backend-plugin-api').DatabaseService
      | undefined,
    adminConfig: overrides.adminConfig as
      | import('../../services/AdminConfigService').AdminConfigService
      | undefined,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockOrchestrator.getResolver.mockReturnValue(null);
  mockOrchestrator.getClientManager.mockReturnValue({
    getExistingClient: jest.fn().mockReturnValue({
      request: jest.fn().mockResolvedValue({ data: [], output: [] }),
    }),
  });
});

describe('LlamaStackProvider', () => {
  describe('constructor', () => {
    it('creates orchestrator, safety, and evaluation services', () => {
      const { LlamaStackOrchestrator } = require('./LlamaStackOrchestrator');
      const { SafetyService } = require('./SafetyService');
      const { EvaluationService } = require('./EvaluationService');

      const logger = createMockLogger();
      createProvider({ logger });

      expect(LlamaStackOrchestrator).toHaveBeenCalledWith(
        expect.objectContaining({ logger }),
      );
      expect(SafetyService).toHaveBeenCalledWith(
        expect.objectContaining({
          logger,
          getClient: expect.any(Function),
        }),
      );
      expect(EvaluationService).toHaveBeenCalledWith(
        expect.objectContaining({
          logger,
          getClient: expect.any(Function),
        }),
      );
    });
  });

  describe('initialize', () => {
    it('calls initialize on all 3 services', async () => {
      const provider = createProvider();
      await provider.initialize();

      expect(mockOrchestrator.initialize).toHaveBeenCalled();
      expect(mockSafetyService.initialize).toHaveBeenCalled();
      expect(mockEvaluationService.initialize).toHaveBeenCalled();
    });
  });

  describe('postInitialize', () => {
    it('delegates to orchestrator', async () => {
      const provider = createProvider();
      await provider.postInitialize();

      expect(mockOrchestrator.postInitialize).toHaveBeenCalled();
    });
  });

  describe('invalidateRuntimeConfig', () => {
    it('delegates to orchestrator', () => {
      const provider = createProvider();
      provider.invalidateRuntimeConfig();

      expect(mockOrchestrator.invalidateRuntimeConfig).toHaveBeenCalled();
    });
  });

  describe('getEffectiveConfig', () => {
    it('returns empty object when resolver is null', async () => {
      mockOrchestrator.getResolver.mockReturnValue(null);
      const provider = createProvider();

      const config = await provider.getEffectiveConfig();

      expect(config).toEqual({});
    });

    it('returns config when resolver is set', async () => {
      const resolvedConfig = { model: 'test-model', baseUrl: 'http://test' };
      mockOrchestrator.getResolver.mockReturnValue({
        resolve: jest.fn().mockResolvedValue(resolvedConfig),
      });
      const provider = createProvider();

      const config = await provider.getEffectiveConfig();

      expect(config).toEqual(resolvedConfig);
    });
  });

  describe('getStatus', () => {
    it('delegates to orchestrator', async () => {
      const status = { ready: true, provider: { id: 'llamastack' } };
      mockOrchestrator.getStatus.mockResolvedValue(status);
      const provider = createProvider();

      const result = await provider.getStatus();

      expect(mockOrchestrator.getStatus).toHaveBeenCalled();
      expect(result).toEqual(status);
    });
  });

  describe('chat', () => {
    it('delegates to orchestrator', async () => {
      const request = { messages: [], model: 'test' };
      const response = { responseId: 'r1', output: [] };
      mockOrchestrator.chat.mockResolvedValue(response);
      const provider = createProvider();

      const result = await provider.chat(request);

      expect(mockOrchestrator.chat).toHaveBeenCalledWith(request);
      expect(result).toEqual(response);
    });
  });

  describe('chatStream', () => {
    it('delegates to orchestrator', async () => {
      const request = { messages: [], model: 'test' };
      const onEvent = jest.fn();
      const provider = createProvider();

      await provider.chatStream(request, onEvent);

      expect(mockOrchestrator.chatStream).toHaveBeenCalledWith(
        request,
        expect.any(Function),
        undefined,
      );
    });

    it('normalizes events and forwards to onEvent', async () => {
      const request = { messages: [], model: 'test' };
      const onEvent = jest.fn();
      const provider = createProvider();

      mockOrchestrator.chatStream.mockImplementation(
        async (
          _req: unknown,
          rawCallback: (raw: string) => void,
          _signal?: AbortSignal,
        ) => {
          rawCallback(
            JSON.stringify({
              type: 'response.output_text.delta',
              delta: 'hello',
            }),
          );
          rawCallback(
            JSON.stringify({ type: 'response.created', response_id: 'resp-1' }),
          );
        },
      );

      await provider.chatStream(request, onEvent);

      expect(onEvent).toHaveBeenCalled();
      const textDeltaCall = onEvent.mock.calls.find(
        (c: [NormalizedStreamEvent]) => c[0].type === 'stream.text.delta',
      );
      expect(textDeltaCall).toBeDefined();
      expect(textDeltaCall[0]).toEqual({
        type: 'stream.text.delta',
        delta: 'hello',
      });
    });

    it('handles HITL approval events and backfills responseId', async () => {
      const request = { messages: [], model: 'test' };
      const onEvent = jest.fn();
      const logger = createMockLogger();
      const provider = createProvider({ logger });

      mockOrchestrator.chatStream.mockImplementation(
        async (
          _req: unknown,
          rawCallback: (raw: string) => void,
          _signal?: AbortSignal,
        ) => {
          rawCallback(
            JSON.stringify({
              type: 'response.created',
              response: { id: 'resp-123' },
            }),
          );
          rawCallback(
            JSON.stringify({
              type: 'response.output_item.added',
              item: {
                type: 'mcp_approval_request',
                id: 'call-1',
                name: 'tool1',
                server_label: 'Server1',
              },
            }),
          );
        },
      );

      await provider.chatStream(request, onEvent);

      const approvalEvent = onEvent.mock.calls.find(
        (c: [NormalizedStreamEvent]) =>
          c[0].type === 'stream.tool.approval' && 'responseId' in c[0],
      );
      expect(approvalEvent).toBeDefined();
      expect(approvalEvent[0]).toMatchObject({
        type: 'stream.tool.approval',
        callId: 'call-1',
        name: 'tool1',
        serverLabel: 'Server1',
        responseId: 'resp-123',
      });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[HITL] Emitting stream.tool.approval'),
      );
    });
  });

  describe('conversations capability', () => {
    it('create delegates to conversation facade', async () => {
      mockConversationFacade.createConversation.mockResolvedValue('conv-1');
      const provider = createProvider();

      const result = await provider.conversations.create();

      expect(mockConversationFacade.createConversation).toHaveBeenCalled();
      expect(result).toEqual({ conversationId: 'conv-1' });
    });

    it('list delegates to conversation facade', async () => {
      const listResult = { conversations: [], nextCursor: 'c1' };
      mockConversationFacade.listConversations.mockResolvedValue(listResult);
      const provider = createProvider();

      const result = await provider.conversations.list(10, 'after-1');

      expect(mockConversationFacade.listConversations).toHaveBeenCalledWith(
        10,
        'desc',
        'after-1',
      );
      expect(result).toEqual(listResult);
    });

    it('get throws on not found', async () => {
      mockConversationFacade.getConversation.mockResolvedValue(null);
      const provider = createProvider();

      await expect(provider.conversations.get('nonexistent')).rejects.toThrow(
        'Conversation not found: nonexistent',
      );
    });

    it('get returns details when found', async () => {
      const details = {
        responseId: 'r1',
        conversationId: 'c1',
        model: 'test',
        createdAt: '2025-01-01',
      };
      mockConversationFacade.getConversation.mockResolvedValue(details);
      const provider = createProvider();

      const result = await provider.conversations.get('r1');

      expect(result).toEqual(details);
    });

    it('getInputs delegates to conversation facade', async () => {
      const inputs = { items: [] };
      mockConversationFacade.getConversationInputs.mockResolvedValue(inputs);
      const provider = createProvider();

      const result = await provider.conversations.getInputs('r1');

      expect(mockConversationFacade.getConversationInputs).toHaveBeenCalledWith(
        'r1',
      );
      expect(result).toEqual(inputs);
    });

    it('getByResponseChain delegates to conversation facade', async () => {
      const chainItems = [{ role: 'user', text: 'hi' }];
      mockConversationFacade.walkResponseChain.mockResolvedValue(chainItems);
      const provider = createProvider();

      // eslint-disable-next-line testing-library/no-await-sync-queries
      const result = await provider.conversations.getByResponseChain('r1');

      expect(mockConversationFacade.walkResponseChain).toHaveBeenCalledWith(
        'r1',
      );
      expect(result.items).toEqual([
        { type: 'message', role: 'user', content: 'hi' },
      ]);
    });

    it('getProcessedMessages delegates to conversation facade', async () => {
      const messages = [{ role: 'user', content: 'hi' }];
      mockConversationFacade.getProcessedMessages.mockResolvedValue(messages);
      const provider = createProvider();

      const result = await provider.conversations.getProcessedMessages('c1');

      expect(mockConversationFacade.getProcessedMessages).toHaveBeenCalledWith(
        'c1',
      );
      expect(result).toEqual(messages);
    });

    it('delete delegates to conversation facade', async () => {
      const provider = createProvider();

      await provider.conversations.delete('r1');

      expect(mockConversationFacade.deleteConversation).toHaveBeenCalledWith(
        'r1',
      );
    });

    it('submitApproval delegates to conversation facade', async () => {
      const approval = {
        responseId: 'r1',
        callId: 'call-1',
        approved: true,
        toolName: 'tool1',
        toolArguments: '{}',
      };
      mockConversationFacade.continueAfterApproval.mockResolvedValue({
        responseId: 'r1',
        output: [],
      });
      const provider = createProvider();

      await provider.conversations.submitApproval(approval);

      expect(mockConversationFacade.continueAfterApproval).toHaveBeenCalledWith(
        'r1',
        'call-1',
        true,
        'tool1',
        '{}',
      );
    });
  });

  describe('rag capability', () => {
    it('listDocuments delegates to vector store facade', async () => {
      const docs = [{ id: 'd1', fileName: 'f1' }];
      mockVectorStoreFacade.listDocuments.mockResolvedValue(docs);
      const provider = createProvider();

      const result = await provider.rag.listDocuments('vs-1');

      expect(mockVectorStoreFacade.listDocuments).toHaveBeenCalledWith('vs-1');
      expect(result).toEqual(docs);
    });

    it('listVectorStores delegates to vector store facade', async () => {
      const stores = [{ id: 'vs-1', name: 'store' }];
      mockVectorStoreFacade.listVectorStores.mockResolvedValue(stores);
      const provider = createProvider();

      const result = await provider.rag.listVectorStores();

      expect(mockVectorStoreFacade.listVectorStores).toHaveBeenCalled();
      expect(result).toEqual(stores);
    });

    it('getDefaultVectorStoreId delegates to vector store facade', () => {
      mockVectorStoreFacade.getDefaultVectorStoreId.mockReturnValue(
        'vs-default',
      );
      const provider = createProvider();

      const result = provider.rag.getDefaultVectorStoreId();

      expect(result).toBe('vs-default');
    });

    it('syncDocuments delegates to vector store facade', async () => {
      const syncResult = {
        added: 2,
        updated: 1,
        removed: 0,
        failed: 0,
        unchanged: 5,
        errors: [] as string[],
      };
      mockVectorStoreFacade.syncDocuments.mockResolvedValue(syncResult);
      const provider = createProvider();

      const result = await provider.rag.syncDocuments();

      expect(mockVectorStoreFacade.syncDocuments).toHaveBeenCalled();
      expect(result).toEqual(syncResult);
    });

    it('uploadDocument delegates to vector store facade', async () => {
      const provider = createProvider();

      const result = await provider.rag.uploadDocument!(
        'file.txt',
        Buffer.from('content'),
        'vs-1',
      );

      expect(mockVectorStoreFacade.uploadDocument).toHaveBeenCalledWith(
        'file.txt',
        expect.any(Buffer),
        'vs-1',
      );
      expect(result).toEqual({
        fileId: 'f1',
        fileName: 'f1.txt',
        status: 'completed',
      });
    });

    it('deleteDocument delegates to vector store facade', async () => {
      const provider = createProvider();

      const result = await provider.rag.deleteDocument!('f1', 'vs-1');

      expect(mockVectorStoreFacade.deleteDocument).toHaveBeenCalledWith(
        'f1',
        'vs-1',
      );
      expect(result).toEqual({ success: true });
    });

    it('searchVectorStore delegates to vector store facade', async () => {
      const searchResult = {
        query: 'test',
        chunks: [{ text: 'chunk1' }],
        vectorStoreId: 'vs-1',
        totalResults: 1,
      };
      mockVectorStoreFacade.searchVectorStore.mockResolvedValue(searchResult);
      const provider = createProvider();

      const result = await provider.rag.searchVectorStore!('test', 10, 'vs-1', [
        'vs-1',
      ]);

      expect(mockVectorStoreFacade.searchVectorStore).toHaveBeenCalledWith(
        'test',
        10,
        'vs-1',
        ['vs-1'],
      );
      expect(result).toEqual(searchResult);
    });
  });

  describe('safety capability', () => {
    it('isEnabled returns safety service state', () => {
      mockSafetyService.isEnabled.mockReturnValue(true);
      const provider = createProvider();

      expect(provider.safety.isEnabled()).toBe(true);

      mockSafetyService.isEnabled.mockReturnValue(false);
      expect(provider.safety.isEnabled()).toBe(false);
    });

    it('getStatus returns enabled and shields', async () => {
      mockSafetyService.isEnabled.mockReturnValue(true);
      mockSafetyService.getAvailableShields.mockReturnValue([
        { identifier: 's1' },
        { identifier: 's2' },
      ]);
      const provider = createProvider();

      const result = await provider.safety.getStatus();

      expect(result).toEqual({
        enabled: true,
        shields: ['s1', 's2'],
      });
    });

    it('checkInput returns safe when no violation', async () => {
      mockSafetyService.checkInput.mockResolvedValue(null);
      const provider = createProvider();

      const result = await provider.safety.checkInput('safe text');

      expect(result).toEqual({ safe: true });
    });

    it('checkInput returns unsafe when violation', async () => {
      mockSafetyService.checkInput.mockResolvedValue({
        user_message: 'Blocked content',
        violation_level: 'high',
      });
      const provider = createProvider();

      const result = await provider.safety.checkInput('bad text');

      expect(result).toEqual({
        safe: false,
        violation: 'Blocked content',
        category: 'high',
      });
    });

    it('checkOutput returns safe when no violation', async () => {
      mockSafetyService.checkOutput.mockResolvedValue(null);
      const provider = createProvider();

      const result = await provider.safety.checkOutput('safe output');

      expect(result).toEqual({ safe: true });
    });

    it('checkOutput returns unsafe when violation', async () => {
      mockSafetyService.checkOutput.mockResolvedValue({
        user_message: 'Harmful output',
        violation_level: 'medium',
      });
      const provider = createProvider();

      const result = await provider.safety.checkOutput('bad output');

      expect(result).toEqual({
        safe: false,
        violation: 'Harmful output',
        category: 'medium',
      });
    });
  });

  describe('evaluation capability', () => {
    it('isEnabled returns evaluation service state', () => {
      mockEvaluationService.isEnabled.mockReturnValue(true);
      const provider = createProvider();

      expect(provider.evaluation.isEnabled()).toBe(true);

      mockEvaluationService.isEnabled.mockReturnValue(false);
      expect(provider.evaluation.isEnabled()).toBe(false);
    });

    it('getStatus returns enabled and scoring functions', async () => {
      mockEvaluationService.isEnabled.mockReturnValue(true);
      mockEvaluationService.getAvailableScoringFunctions.mockReturnValue([
        { identifier: 'f1' },
      ]);
      const provider = createProvider();

      const result = await provider.evaluation.getStatus();

      expect(result).toEqual({
        enabled: true,
        scoringFunctions: ['f1'],
      });
    });

    it('evaluateResponse returns skipped result when no result', async () => {
      mockEvaluationService.scoreResponse.mockResolvedValue(null);
      const provider = createProvider();

      const result = await provider.evaluation.evaluateResponse(
        'user msg',
        'assistant msg',
      );

      expect(result.skipped).toBe(true);
      expect(result.overallScore).toBe(0);
      expect(result.passedThreshold).toBe(true);
    });

    it('evaluateResponse returns result when scoreResponse returns data', async () => {
      const evalResult = {
        overallScore: 0.9,
        scores: { relevance: 0.95 },
        passedThreshold: true,
        qualityLevel: 'good' as const,
        evaluatedAt: '2025-01-01T00:00:00Z',
      };
      mockEvaluationService.scoreResponse.mockResolvedValue(evalResult);
      const provider = createProvider();

      const result = await provider.evaluation.evaluateResponse(
        'user msg',
        'assistant msg',
        ['ctx1'],
      );

      expect(mockEvaluationService.scoreResponse).toHaveBeenCalledWith(
        'user msg',
        'assistant msg',
        ['ctx1'],
      );
      expect(result).toEqual(evalResult);
    });
  });

  describe('testModel', () => {
    it('returns connection failure when listAvailableModels throws', async () => {
      const mockRequest = jest
        .fn()
        .mockRejectedValue(new Error('Connection refused'));
      mockOrchestrator.getClientManager.mockReturnValue({
        getExistingClient: jest.fn().mockReturnValue({ request: mockRequest }),
      });
      const provider = createProvider();

      const result = await provider.testModel();

      expect(result).toEqual({
        connected: false,
        modelFound: false,
        canGenerate: false,
        error: 'Connection refused',
      });
    });

    it('returns model not found when target model not in list', async () => {
      mockOrchestrator.getResolver.mockReturnValue({
        resolve: jest.fn().mockResolvedValue({ model: 'missing-model' }),
      });
      mockOrchestrator.getClientManager.mockReturnValue({
        getExistingClient: jest.fn().mockReturnValue({
          request: jest
            .fn()
            .mockResolvedValueOnce({ data: [{ id: 'other-model' }] })
            .mockResolvedValueOnce({ output: [], usage: { output_tokens: 1 } }),
        }),
      });
      const provider = createProvider();

      const result = await provider.testModel();

      expect(result).toEqual({
        connected: true,
        modelFound: false,
        canGenerate: false,
        error: 'Model "missing-model" not found on server',
      });
    });

    it('returns no model configured when resolver has no model', async () => {
      mockOrchestrator.getResolver.mockReturnValue({
        resolve: jest.fn().mockResolvedValue({}),
      });
      mockOrchestrator.getClientManager.mockReturnValue({
        getExistingClient: jest.fn().mockReturnValue({
          request: jest.fn().mockResolvedValue({ data: [{ id: 'model-1' }] }),
        }),
      });
      const provider = createProvider();

      const result = await provider.testModel();

      expect(result).toEqual({
        connected: true,
        modelFound: false,
        canGenerate: false,
        error: 'No model configured',
      });
    });

    it('returns successful when model found and inference works', async () => {
      mockOrchestrator.getResolver.mockReturnValue({
        resolve: jest.fn().mockResolvedValue({ model: 'model-1' }),
      });
      mockOrchestrator.getClientManager.mockReturnValue({
        getExistingClient: jest.fn().mockReturnValue({
          request: jest
            .fn()
            .mockResolvedValueOnce({ data: [{ id: 'model-1' }] })
            .mockResolvedValueOnce({
              output: [
                {
                  type: 'message',
                  content: [{ type: 'output_text', text: 'hi' }],
                },
              ],
              usage: { output_tokens: 5 },
            }),
        }),
      });
      const provider = createProvider();

      const result = await provider.testModel();

      expect(result).toEqual({
        connected: true,
        modelFound: true,
        canGenerate: true,
      });
    });

    it('uses modelOverride when provided', async () => {
      mockOrchestrator.getResolver.mockReturnValue(null);
      mockOrchestrator.getClientManager.mockReturnValue({
        getExistingClient: jest.fn().mockReturnValue({
          request: jest
            .fn()
            .mockResolvedValueOnce({ data: [{ id: 'override-model' }] })
            .mockResolvedValueOnce({
              output: [
                {
                  type: 'message',
                  content: [{ type: 'output_text', text: 'ok' }],
                },
              ],
              usage: { output_tokens: 2 },
            }),
        }),
      });
      const provider = createProvider();

      const result = await provider.testModel('override-model');

      expect(result).toEqual({
        connected: true,
        modelFound: true,
        canGenerate: true,
      });
    });
  });
});
