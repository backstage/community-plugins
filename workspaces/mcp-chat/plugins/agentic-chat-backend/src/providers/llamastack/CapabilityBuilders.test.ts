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
  buildConversationsCapability,
  buildRagCapability,
  buildSafetyCapability,
  buildEvaluationCapability,
} from './CapabilityBuilders';
import type { ConversationFacade } from './ConversationFacade';
import type { VectorStoreFacade } from './VectorStoreFacade';
import type { SafetyService } from './SafetyService';
import type { EvaluationService } from './EvaluationService';
import type { ProcessedMessage } from '../types';
import {
  FileFormat,
  type DocumentInfo,
} from '@backstage-community/plugin-agentic-chat-common';

function createMockConversationFacade(): jest.Mocked<ConversationFacade> {
  return {
    createConversation: jest.fn().mockResolvedValue('conv_123'),
    listConversations: jest.fn().mockResolvedValue({
      conversations: [],
      hasMore: false,
    }),
    getConversation: jest.fn().mockResolvedValue(null),
    getConversationInputs: jest.fn().mockResolvedValue({
      items: [],
      hasMore: false,
    }),
    deleteConversation: jest.fn().mockResolvedValue(true),
    getProcessedMessages: jest.fn().mockResolvedValue([]),
    walkResponseChain: jest.fn().mockResolvedValue([]),
    continueAfterApproval: jest.fn().mockResolvedValue({
      responseId: 'r1',
      output: [],
    }),
  } as unknown as jest.Mocked<ConversationFacade>;
}

function createMockVectorStoreFacade(): jest.Mocked<VectorStoreFacade> {
  return {
    listDocuments: jest.fn().mockResolvedValue([]),
    listVectorStores: jest.fn().mockResolvedValue([]),
    getDefaultVectorStoreId: jest.fn().mockReturnValue('vs_123'),
    getActiveVectorStoreIds: jest.fn().mockResolvedValue(['vs_123']),
    syncDocuments: jest.fn().mockResolvedValue({
      added: 0,
      updated: 0,
      removed: 0,
      failed: 0,
      unchanged: 0,
      errors: [],
    }),
    uploadDocument: jest.fn().mockResolvedValue({
      fileId: 'f1',
      fileName: 'doc.txt',
      status: 'completed',
    }),
    deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    searchVectorStore: jest.fn().mockResolvedValue({
      query: 'test',
      chunks: [],
      vectorStoreId: 'vs_123',
      totalResults: 0,
    }),
    getVectorStoreConfig: jest.fn().mockResolvedValue(null),
    createVectorStoreWithConfig: jest.fn().mockResolvedValue({
      vectorStoreId: 'vs_new',
      vectorStoreName: 'new-store',
      created: true,
      embeddingModel: 'model',
      embeddingDimension: 384,
    }),
    getVectorStoreStatus: jest.fn().mockResolvedValue({
      exists: true,
      vectorStoreId: 'vs_123',
      ready: true,
    }),
    addVectorStoreId: jest.fn(),
    removeVectorStoreId: jest.fn(),
    deleteVectorStore: jest.fn().mockResolvedValue({
      success: true,
      filesDeleted: 0,
    }),
  } as unknown as jest.Mocked<VectorStoreFacade>;
}

function createMockSafetyService(): jest.Mocked<SafetyService> {
  return {
    isEnabled: jest.fn().mockReturnValue(true),
    getAvailableShields: jest.fn().mockReturnValue([
      {
        identifier: 'shield1',
        provider_id: 'p1',
        provider_resource_id: 'pr1',
        type: 'llama-guard',
      },
      {
        identifier: 'shield2',
        provider_id: 'p2',
        provider_resource_id: 'pr2',
        type: 'prompt-guard',
      },
    ]),
    checkInput: jest.fn().mockResolvedValue(undefined),
    checkOutput: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<SafetyService>;
}

function createMockEvaluationService(): jest.Mocked<EvaluationService> {
  return {
    isEnabled: jest.fn().mockReturnValue(true),
    getAvailableScoringFunctions: jest.fn().mockReturnValue([
      {
        identifier: 'score1',
        provider_id: 'p1',
        provider_resource_id: 'pr1',
        type: 'llm-as-judge',
      },
      {
        identifier: 'score2',
        provider_id: 'p2',
        provider_resource_id: 'pr2',
        type: 'regex',
      },
    ]),
    scoreResponse: jest.fn().mockResolvedValue({
      overallScore: 0.9,
      scores: { score1: 0.9 },
      passedThreshold: true,
      qualityLevel: 'good',
      evaluatedAt: new Date().toISOString(),
    }),
  } as unknown as jest.Mocked<EvaluationService>;
}

describe('CapabilityBuilders', () => {
  describe('buildConversationsCapability', () => {
    let mockFacade: jest.Mocked<ConversationFacade>;

    beforeEach(() => {
      jest.clearAllMocks();
      mockFacade = createMockConversationFacade();
    });

    it('create delegates to facade.createConversation', async () => {
      const cap = buildConversationsCapability(mockFacade);
      const result = await cap.create();
      expect(mockFacade.createConversation).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ conversationId: 'conv_123' });
    });

    it('list delegates to facade.listConversations with limit, desc, after', async () => {
      const listResult = {
        conversations: [
          {
            responseId: 'r1',
            conversationId: 'c1',
            createdAt: new Date(0),
            preview: 'Chat',
            model: 'model',
            status: 'completed' as const,
          },
        ],
        hasMore: true,
      };
      mockFacade.listConversations.mockResolvedValue(listResult);

      const cap = buildConversationsCapability(mockFacade);
      const result = await cap.list(10, 'after_1');

      expect(mockFacade.listConversations).toHaveBeenCalledWith(
        10,
        'desc',
        'after_1',
      );
      expect(result).toEqual(listResult);
    });

    it('get delegates to facade.getConversation and returns details', async () => {
      const details = {
        id: 'c1',
        createdAt: new Date(0),
        model: 'model',
        status: 'completed' as const,
        input: 'hello',
        output: [],
      };
      mockFacade.getConversation.mockResolvedValue(details);

      const cap = buildConversationsCapability(mockFacade);
      const result = await cap.get('r1');

      expect(mockFacade.getConversation).toHaveBeenCalledWith('r1');
      expect(result).toEqual(details);
    });

    it('get throws when facade.getConversation returns null', async () => {
      mockFacade.getConversation.mockResolvedValue(null);
      const cap = buildConversationsCapability(mockFacade);
      await expect(cap.get('r1')).rejects.toThrow('Conversation not found: r1');
    });

    it('getInputs delegates to facade.getConversationInputs', async () => {
      const inputs = {
        items: [{ type: 'message', role: 'user', content: 'hi' }],
        hasMore: false,
      };
      mockFacade.getConversationInputs.mockResolvedValue(inputs);

      const cap = buildConversationsCapability(mockFacade);
      const result = await cap.getInputs('r1');

      expect(mockFacade.getConversationInputs).toHaveBeenCalledWith('r1');
      expect(result).toEqual(inputs);
    });

    it('getByResponseChain delegates to facade.walkResponseChain and maps items', async () => {
      mockFacade.walkResponseChain.mockResolvedValue([
        { role: 'user', text: 'hello' },
        { role: 'assistant', text: 'hi' },
      ]);

      const cap = buildConversationsCapability(mockFacade);
      // eslint-disable-next-line testing-library/no-await-sync-queries
      const result = await cap.getByResponseChain('r1');

      expect(mockFacade.walkResponseChain).toHaveBeenCalledWith('r1');
      expect(result.items).toEqual([
        { type: 'message', role: 'user', content: 'hello' },
        { type: 'message', role: 'assistant', content: 'hi' },
      ]);
    });

    it('getProcessedMessages delegates to facade.getProcessedMessages', async () => {
      const messages: ProcessedMessage[] = [
        { role: 'user', text: 'hi' },
        { role: 'assistant', text: 'hello' },
      ];
      mockFacade.getProcessedMessages.mockResolvedValue(messages);

      const cap = buildConversationsCapability(mockFacade);
      const result = await cap.getProcessedMessages('c1');

      expect(mockFacade.getProcessedMessages).toHaveBeenCalledWith('c1');
      expect(result).toEqual(messages);
    });

    it('delete delegates to facade.deleteConversation', async () => {
      const cap = buildConversationsCapability(mockFacade);
      await cap.delete('r1');
      expect(mockFacade.deleteConversation).toHaveBeenCalledWith('r1');
    });

    it('submitApproval delegates to facade.continueAfterApproval with approval fields', async () => {
      const approvalResult = {
        content: 'Tool executed successfully',
        responseId: 'r1',
        toolExecuted: true,
      };
      mockFacade.continueAfterApproval.mockResolvedValue(approvalResult);

      const cap = buildConversationsCapability(mockFacade);
      const result = await cap.submitApproval({
        responseId: 'r1',
        callId: 'call_1',
        approved: true,
        toolName: 'tool1',
        toolArguments: '{}',
      });

      expect(mockFacade.continueAfterApproval).toHaveBeenCalledWith(
        'r1',
        'call_1',
        true,
        'tool1',
        '{}',
      );
      expect(result).toEqual(approvalResult);
    });
  });

  describe('buildRagCapability', () => {
    let mockFacade: jest.Mocked<VectorStoreFacade>;

    beforeEach(() => {
      jest.clearAllMocks();
      mockFacade = createMockVectorStoreFacade();
    });

    it('listDocuments delegates to facade.listDocuments', async () => {
      const docs: DocumentInfo[] = [
        {
          id: 'f1',
          fileName: 'a.md',
          format: FileFormat.MARKDOWN,
          fileSize: 10,
          uploadedAt: '',
          status: 'completed',
        },
      ];
      mockFacade.listDocuments.mockResolvedValue(docs);

      const cap = buildRagCapability(mockFacade);
      const result = await cap.listDocuments('vs_123');

      expect(mockFacade.listDocuments).toHaveBeenCalledWith('vs_123');
      expect(result).toEqual(docs);
    });

    it('listVectorStores delegates to facade.listVectorStores', async () => {
      const stores = [
        {
          id: 'vs_1',
          name: 'store1',
          status: 'active',
          fileCount: 5,
          createdAt: Date.now(),
        },
      ];
      mockFacade.listVectorStores.mockResolvedValue(stores);

      const cap = buildRagCapability(mockFacade);
      const result = await cap.listVectorStores();

      expect(mockFacade.listVectorStores).toHaveBeenCalled();
      expect(result).toEqual(stores);
    });

    it('getDefaultVectorStoreId delegates to facade.getDefaultVectorStoreId', () => {
      mockFacade.getDefaultVectorStoreId.mockReturnValue('vs_default');
      const cap = buildRagCapability(mockFacade);
      expect(cap.getDefaultVectorStoreId()).toBe('vs_default');
      expect(mockFacade.getDefaultVectorStoreId).toHaveBeenCalled();
    });

    it('getActiveVectorStoreIds delegates to facade.getActiveVectorStoreIds', async () => {
      mockFacade.getActiveVectorStoreIds.mockResolvedValue(['vs_1', 'vs_2']);
      const cap = buildRagCapability(mockFacade);
      const result = await cap.getActiveVectorStoreIds();
      expect(mockFacade.getActiveVectorStoreIds).toHaveBeenCalled();
      expect(result).toEqual(['vs_1', 'vs_2']);
    });

    it('syncDocuments delegates to facade.syncDocuments', async () => {
      const syncResult = {
        added: 5,
        updated: 0,
        removed: 0,
        failed: 0,
        unchanged: 0,
        errors: [],
      };
      mockFacade.syncDocuments.mockResolvedValue(syncResult);

      const cap = buildRagCapability(mockFacade);
      const result = await cap.syncDocuments();

      expect(mockFacade.syncDocuments).toHaveBeenCalled();
      expect(result).toEqual(syncResult);
    });

    it('uploadDocument delegates to facade.uploadDocument', async () => {
      const content = Buffer.from('hello');
      mockFacade.uploadDocument.mockResolvedValue({
        fileId: 'f1',
        fileName: 'doc.txt',
        status: 'completed',
      });

      const cap = buildRagCapability(mockFacade);
      const result = await cap.uploadDocument!('doc.txt', content, 'vs_123');

      expect(mockFacade.uploadDocument).toHaveBeenCalledWith(
        'doc.txt',
        content,
        'vs_123',
      );
      expect(result).toEqual({
        fileId: 'f1',
        fileName: 'doc.txt',
        status: 'completed',
      });
    });

    it('deleteDocument delegates to facade.deleteDocument', async () => {
      mockFacade.deleteDocument.mockResolvedValue({ success: true });

      const cap = buildRagCapability(mockFacade);
      const result = await cap.deleteDocument!('f1', 'vs_123');

      expect(mockFacade.deleteDocument).toHaveBeenCalledWith('f1', 'vs_123');
      expect(result).toEqual({ success: true });
    });

    it('searchVectorStore delegates to facade.searchVectorStore', async () => {
      const searchResult = {
        query: 'test',
        chunks: [{ text: 'chunk1', score: 0.9 }],
        vectorStoreId: 'vs_123',
        totalResults: 1,
      };
      mockFacade.searchVectorStore.mockResolvedValue(searchResult);

      const cap = buildRagCapability(mockFacade);
      const result = await cap.searchVectorStore!('test', 10, 'vs_123', [
        'vs_123',
      ]);

      expect(mockFacade.searchVectorStore).toHaveBeenCalledWith(
        'test',
        10,
        'vs_123',
        ['vs_123'],
      );
      expect(result).toEqual(searchResult);
    });

    it('getVectorStoreConfig delegates to facade.getVectorStoreConfig', async () => {
      const config = {
        vectorStoreName: 'store',
        embeddingModel: 'model',
        embeddingDimension: 384,
        chunkingStrategy: 'auto' as const,
        maxChunkSizeTokens: 512,
        chunkOverlapTokens: 50,
      };
      mockFacade.getVectorStoreConfig.mockResolvedValue(config);

      const cap = buildRagCapability(mockFacade);
      const result = await cap.getVectorStoreConfig!();

      expect(mockFacade.getVectorStoreConfig).toHaveBeenCalled();
      expect(result).toEqual(config);
    });

    it('createVectorStoreWithConfig delegates to facade.createVectorStoreWithConfig', async () => {
      const overrides = { embeddingModel: 'custom' };
      mockFacade.createVectorStoreWithConfig.mockResolvedValue({
        vectorStoreId: 'vs_new',
        vectorStoreName: 'new',
        created: true,
        embeddingModel: 'custom',
      });

      const cap = buildRagCapability(mockFacade);
      const result = await cap.createVectorStoreWithConfig!(overrides);

      expect(mockFacade.createVectorStoreWithConfig).toHaveBeenCalledWith(
        overrides,
      );
      expect(result.vectorStoreId).toBe('vs_new');
    });

    it('getVectorStoreStatus delegates to facade.getVectorStoreStatus', async () => {
      const status = { exists: true, vectorStoreId: 'vs_1', ready: true };
      mockFacade.getVectorStoreStatus.mockResolvedValue(status);

      const cap = buildRagCapability(mockFacade);
      const result = await cap.getVectorStoreStatus!();

      expect(mockFacade.getVectorStoreStatus).toHaveBeenCalled();
      expect(result).toEqual(status);
    });

    it('addVectorStoreId delegates to facade.addVectorStoreId', () => {
      const cap = buildRagCapability(mockFacade);
      cap.addVectorStoreId!('vs_new');
      expect(mockFacade.addVectorStoreId).toHaveBeenCalledWith('vs_new');
    });

    it('removeVectorStoreId delegates to facade.removeVectorStoreId', () => {
      const cap = buildRagCapability(mockFacade);
      cap.removeVectorStoreId!('vs_old');
      expect(mockFacade.removeVectorStoreId).toHaveBeenCalledWith('vs_old');
    });

    it('deleteVectorStore delegates to facade.deleteVectorStore', async () => {
      mockFacade.deleteVectorStore.mockResolvedValue({
        success: true,
        filesDeleted: 3,
      });

      const cap = buildRagCapability(mockFacade);
      const result = await cap.deleteVectorStore!('vs_123');

      expect(mockFacade.deleteVectorStore).toHaveBeenCalledWith('vs_123');
      expect(result).toEqual({ success: true, filesDeleted: 3 });
    });
  });

  describe('buildSafetyCapability', () => {
    let mockService: jest.Mocked<SafetyService>;

    beforeEach(() => {
      jest.clearAllMocks();
      mockService = createMockSafetyService();
    });

    it('isEnabled delegates to safetyService.isEnabled', () => {
      mockService.isEnabled.mockReturnValue(true);
      const cap = buildSafetyCapability(mockService);
      expect(cap.isEnabled()).toBe(true);
      expect(mockService.isEnabled).toHaveBeenCalled();

      mockService.isEnabled.mockReturnValue(false);
      expect(cap.isEnabled()).toBe(false);
    });

    it('getStatus returns enabled and shields from service', async () => {
      mockService.isEnabled.mockReturnValue(true);
      mockService.getAvailableShields.mockReturnValue([
        {
          identifier: 's1',
          provider_id: 'p1',
          provider_resource_id: 'pr1',
          type: 'llama-guard',
        },
        {
          identifier: 's2',
          provider_id: 'p2',
          provider_resource_id: 'pr2',
          type: 'prompt-guard',
        },
      ]);

      const cap = buildSafetyCapability(mockService);
      const result = await cap.getStatus();

      expect(result).toEqual({
        enabled: true,
        shields: ['s1', 's2'],
      });
      expect(mockService.isEnabled).toHaveBeenCalled();
      expect(mockService.getAvailableShields).toHaveBeenCalled();
    });

    it('checkInput returns safe: true when no violation', async () => {
      mockService.checkInput.mockResolvedValue(undefined);

      const cap = buildSafetyCapability(mockService);
      const result = await cap.checkInput('hello');

      expect(mockService.checkInput).toHaveBeenCalledWith('hello');
      expect(result).toEqual({ safe: true });
    });

    it('checkInput returns safe: false with violation when service returns violation', async () => {
      mockService.checkInput.mockResolvedValue({
        user_message: 'Blocked content',
        violation_level: 'error',
      });

      const cap = buildSafetyCapability(mockService);
      const result = await cap.checkInput('bad input');

      expect(mockService.checkInput).toHaveBeenCalledWith('bad input');
      expect(result).toEqual({
        safe: false,
        violation: 'Blocked content',
        category: 'error',
      });
    });

    it('checkOutput returns safe: true when no violation', async () => {
      mockService.checkOutput.mockResolvedValue(undefined);

      const cap = buildSafetyCapability(mockService);
      const result = await cap.checkOutput('response');

      expect(mockService.checkOutput).toHaveBeenCalledWith('response');
      expect(result).toEqual({ safe: true });
    });

    it('checkOutput returns safe: false with violation when service returns violation', async () => {
      mockService.checkOutput.mockResolvedValue({
        user_message: 'Harmful output',
        violation_level: 'warn',
      });

      const cap = buildSafetyCapability(mockService);
      const result = await cap.checkOutput('bad output');

      expect(mockService.checkOutput).toHaveBeenCalledWith('bad output');
      expect(result).toEqual({
        safe: false,
        violation: 'Harmful output',
        category: 'warn',
      });
    });
  });

  describe('buildEvaluationCapability', () => {
    let mockService: jest.Mocked<EvaluationService>;

    beforeEach(() => {
      jest.clearAllMocks();
      mockService = createMockEvaluationService();
    });

    it('isEnabled delegates to evaluationService.isEnabled', () => {
      mockService.isEnabled.mockReturnValue(true);
      const cap = buildEvaluationCapability(mockService);
      expect(cap.isEnabled()).toBe(true);
      expect(mockService.isEnabled).toHaveBeenCalled();

      mockService.isEnabled.mockReturnValue(false);
      expect(cap.isEnabled()).toBe(false);
    });

    it('getStatus returns enabled and scoringFunctions from service', async () => {
      mockService.isEnabled.mockReturnValue(true);
      mockService.getAvailableScoringFunctions.mockReturnValue([
        {
          identifier: 'sf1',
          provider_id: 'p1',
          provider_resource_id: 'pr1',
          type: 'llm-as-judge',
        },
        {
          identifier: 'sf2',
          provider_id: 'p2',
          provider_resource_id: 'pr2',
          type: 'regex',
        },
      ]);

      const cap = buildEvaluationCapability(mockService);
      const result = await cap.getStatus();

      expect(result).toEqual({
        enabled: true,
        scoringFunctions: ['sf1', 'sf2'],
      });
      expect(mockService.isEnabled).toHaveBeenCalled();
      expect(mockService.getAvailableScoringFunctions).toHaveBeenCalled();
    });

    it('evaluateResponse delegates to evaluationService.scoreResponse', async () => {
      const evalResult = {
        overallScore: 0.95,
        scores: { quality: 0.95 },
        passedThreshold: true,
        qualityLevel: 'excellent' as const,
        evaluatedAt: new Date().toISOString(),
      };
      mockService.scoreResponse.mockResolvedValue(evalResult);

      const cap = buildEvaluationCapability(mockService);
      const result = await cap.evaluateResponse('user msg', 'assistant reply', [
        'ctx1',
      ]);

      expect(mockService.scoreResponse).toHaveBeenCalledWith(
        'user msg',
        'assistant reply',
        ['ctx1'],
      );
      expect(result).toEqual(evalResult);
    });

    it('evaluateResponse returns skipped result when scoreResponse returns null', async () => {
      mockService.scoreResponse.mockResolvedValue(null as unknown as undefined);

      const cap = buildEvaluationCapability(mockService);
      const result = await cap.evaluateResponse('user', 'assistant');

      expect(mockService.scoreResponse).toHaveBeenCalledWith(
        'user',
        'assistant',
        undefined,
      );
      expect(result.skipped).toBe(true);
      expect(result.overallScore).toBe(0);
      expect(result.qualityLevel).toBe('poor');
    });
  });

  describe('error propagation', () => {
    it('buildConversationsCapability propagates errors from facade', async () => {
      const mockFacade = createMockConversationFacade();
      const err = new Error('create failed');
      mockFacade.createConversation.mockRejectedValue(err);

      const cap = buildConversationsCapability(mockFacade);
      await expect(cap.create()).rejects.toThrow('create failed');
    });

    it('buildRagCapability propagates errors from facade', async () => {
      const mockFacade = createMockVectorStoreFacade();
      const err = new Error('upload failed');
      mockFacade.uploadDocument.mockRejectedValue(err);

      const cap = buildRagCapability(mockFacade);
      await expect(
        cap.uploadDocument!('x.txt', Buffer.from('x')),
      ).rejects.toThrow('upload failed');
    });

    it('buildSafetyCapability propagates errors from service', async () => {
      const mockService = createMockSafetyService();
      const err = new Error('check failed');
      mockService.checkInput.mockRejectedValue(err);

      const cap = buildSafetyCapability(mockService);
      await expect(cap.checkInput('text')).rejects.toThrow('check failed');
    });

    it('buildEvaluationCapability propagates errors from service', async () => {
      const mockService = createMockEvaluationService();
      const err = new Error('score failed');
      mockService.scoreResponse.mockRejectedValue(err);

      const cap = buildEvaluationCapability(mockService);
      await expect(cap.evaluateResponse('u', 'a')).rejects.toThrow(
        'score failed',
      );
    });
  });
});
