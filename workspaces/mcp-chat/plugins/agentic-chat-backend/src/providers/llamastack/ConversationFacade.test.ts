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
import { ConversationFacade } from './ConversationFacade';
import type {
  ConversationFacadeContext,
  ConversationFacadeDeps,
} from './ConversationFacade';
import type {
  ConversationService,
  ConversationListResult,
  ConversationDetails,
  InputItemsResult,
  ConversationItemsResult,
  ProcessedMessage,
  ApprovalResult,
} from './ConversationService';

function createMockContext(
  overrides?: Partial<ConversationFacadeContext>,
): ConversationFacadeContext {
  return {
    ensureInitialized: jest.fn(),
    ...overrides,
  };
}

function createMockConversations(): jest.Mocked<ConversationService> {
  return {
    listConversations: jest
      .fn()
      .mockResolvedValue({ conversations: [], hasMore: false }),
    getConversation: jest.fn().mockResolvedValue(null),
    getConversationInputs: jest
      .fn()
      .mockResolvedValue({ items: [], hasMore: false }),
    deleteConversation: jest.fn().mockResolvedValue(true),
    createConversation: jest.fn().mockResolvedValue('conv_123'),
    getConversationItems: jest.fn().mockResolvedValue({ items: [] }),
    getProcessedMessages: jest.fn().mockResolvedValue([]),
    walkResponseChain: jest.fn().mockResolvedValue([]),
    continueAfterApproval: jest.fn().mockResolvedValue({} as ApprovalResult),
  } as unknown as jest.Mocked<ConversationService>;
}

describe('ConversationFacade', () => {
  let mockContext: jest.Mocked<ConversationFacadeContext>;
  let mockConversations: jest.Mocked<ConversationService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = createMockContext() as jest.Mocked<ConversationFacadeContext>;
    mockConversations = createMockConversations();
  });

  function createFacade(
    deps?: Partial<ConversationFacadeDeps>,
  ): ConversationFacade {
    return new ConversationFacade({
      conversations: mockConversations,
      context: mockContext,
      ...deps,
    });
  }

  describe('constructor and setConversations', () => {
    it('creates instance with dependencies', () => {
      const facade = createFacade();
      expect(facade).toBeDefined();
    });

    it('setConversations updates conversation service reference', () => {
      const facade = createFacade({ conversations: null });
      facade.setConversations(mockConversations);
      expect(mockConversations).toBeDefined();
    });
  });

  describe('listConversations', () => {
    it('delegates to conversations service', async () => {
      const listResult: ConversationListResult = {
        conversations: [
          {
            responseId: 'r1',
            conversationId: 'c1',
            createdAt: new Date(0),
            preview: 'Chat',
            model: 'test-model',
            status: 'completed' as const,
          },
        ],
        hasMore: true,
      };
      mockConversations.listConversations.mockResolvedValue(listResult);

      const facade = createFacade();
      const result = await facade.listConversations(10, 'desc', 'after_1');

      expect(mockContext.ensureInitialized).toHaveBeenCalled();
      expect(mockConversations.listConversations).toHaveBeenCalledWith(
        10,
        'desc',
        'after_1',
      );
      expect(result).toEqual(listResult);
    });

    it('returns empty result when conversations is null', async () => {
      const facade = createFacade({ conversations: null });
      const result = await facade.listConversations();
      expect(result).toEqual({ conversations: [], hasMore: false });
      expect(mockConversations.listConversations).not.toHaveBeenCalled();
    });
  });

  describe('getConversation', () => {
    it('delegates to conversations service', async () => {
      const details: ConversationDetails = {
        id: 'r1',
        model: 'test-model',
        status: 'completed',
        createdAt: new Date(0),
        input: [],
        output: [],
      };
      mockConversations.getConversation.mockResolvedValue(details);

      const facade = createFacade();
      const result = await facade.getConversation('r1');

      expect(mockContext.ensureInitialized).toHaveBeenCalled();
      expect(mockConversations.getConversation).toHaveBeenCalledWith('r1');
      expect(result).toEqual(details);
    });

    it('returns null when conversations is null', async () => {
      const facade = createFacade({ conversations: null });
      const result = await facade.getConversation('r1');
      expect(result).toBeNull();
    });
  });

  describe('getConversationInputs', () => {
    it('delegates to conversations service', async () => {
      const inputs: InputItemsResult = {
        items: [{ type: 'message', role: 'user', content: 'Hi' }],
        hasMore: false,
      };
      mockConversations.getConversationInputs.mockResolvedValue(inputs);

      const facade = createFacade();
      const result = await facade.getConversationInputs('r1');

      expect(mockConversations.getConversationInputs).toHaveBeenCalledWith(
        'r1',
      );
      expect(result).toEqual(inputs);
    });

    it('returns empty when conversations is null', async () => {
      const facade = createFacade({ conversations: null });
      const result = await facade.getConversationInputs('r1');
      expect(result).toEqual({ items: [], hasMore: false });
    });
  });

  describe('deleteConversation', () => {
    it('delegates to conversations service', async () => {
      mockConversations.deleteConversation.mockResolvedValue(true);

      const facade = createFacade();
      const result = await facade.deleteConversation('r1', 'c1');

      expect(mockConversations.deleteConversation).toHaveBeenCalledWith(
        'r1',
        'c1',
      );
      expect(result).toBe(true);
    });

    it('returns false when conversations is null', async () => {
      const facade = createFacade({ conversations: null });
      const result = await facade.deleteConversation('r1');
      expect(result).toBe(false);
    });
  });

  describe('createConversation', () => {
    it('delegates to conversations service and returns conversation ID', async () => {
      mockConversations.createConversation.mockResolvedValue('conv_new');

      const facade = createFacade();
      const result = await facade.createConversation();

      expect(mockContext.ensureInitialized).toHaveBeenCalled();
      expect(mockConversations.createConversation).toHaveBeenCalled();
      expect(result).toBe('conv_new');
    });

    it('throws when conversations is null', async () => {
      const facade = createFacade({ conversations: null });
      await expect(facade.createConversation()).rejects.toThrow(
        'Conversation service not initialized',
      );
    });
  });

  describe('getConversationItems', () => {
    it('delegates to conversations service', async () => {
      const items: ConversationItemsResult = {
        items: [{ type: 'message', role: 'user', content: 'Hello' }],
      };
      mockConversations.getConversationItems.mockResolvedValue(items);

      const facade = createFacade();
      const result = await facade.getConversationItems('c1');

      expect(mockConversations.getConversationItems).toHaveBeenCalledWith('c1');
      expect(result).toEqual(items);
    });

    it('returns empty items when conversations is null', async () => {
      const facade = createFacade({ conversations: null });
      const result = await facade.getConversationItems('c1');
      expect(result).toEqual({ items: [] });
    });
  });

  describe('getProcessedMessages', () => {
    it('delegates to conversations service', async () => {
      const messages: ProcessedMessage[] = [
        { role: 'user', text: 'Hi' },
        { role: 'assistant', text: 'Hello' },
      ];
      mockConversations.getProcessedMessages.mockResolvedValue(messages);

      const facade = createFacade();
      const result = await facade.getProcessedMessages('c1');

      expect(mockConversations.getProcessedMessages).toHaveBeenCalledWith('c1');
      expect(result).toEqual(messages);
    });

    it('returns empty array when conversations is null', async () => {
      const facade = createFacade({ conversations: null });
      const result = await facade.getProcessedMessages('c1');
      expect(result).toEqual([]);
    });
  });

  describe('walkResponseChain', () => {
    it('delegates to conversations service', async () => {
      const chain = [
        { role: 'user' as const, text: 'Hi' },
        { role: 'assistant' as const, text: 'Hello' },
      ];
      mockConversations.walkResponseChain.mockResolvedValue(chain);

      const facade = createFacade();
      const result = await facade.walkResponseChain('r1');

      expect(mockConversations.walkResponseChain).toHaveBeenCalledWith('r1');
      expect(result).toEqual(chain);
    });

    it('returns empty array when conversations is null', async () => {
      const facade = createFacade({ conversations: null });
      const result = await facade.walkResponseChain('r1');
      expect(result).toEqual([]);
    });
  });

  describe('continueAfterApproval', () => {
    it('delegates to conversations service', async () => {
      const approvalResult: ApprovalResult = {
        content: 'ok',
        responseId: 'r1',
        toolExecuted: true,
      };
      mockConversations.continueAfterApproval.mockResolvedValue(approvalResult);

      const facade = createFacade();
      const result = await facade.continueAfterApproval(
        'r1',
        'approval_1',
        true,
        'tool_name',
        '{"arg":1}',
        'c1',
      );

      expect(mockConversations.continueAfterApproval).toHaveBeenCalledWith(
        'r1',
        'approval_1',
        true,
        'tool_name',
        '{"arg":1}',
        'c1',
      );
      expect(result).toEqual(approvalResult);
    });

    it('throws when conversations is null', async () => {
      const facade = createFacade({ conversations: null });
      await expect(
        facade.continueAfterApproval('r1', 'approval_1', true),
      ).rejects.toThrow('Conversation service not initialized');
    });
  });
});
