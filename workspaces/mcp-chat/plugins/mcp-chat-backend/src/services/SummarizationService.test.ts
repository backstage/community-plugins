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

import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { SummarizationService } from './SummarizationService';
import { MCPClientService } from './MCPClientService';
import { ChatMessage } from '../types';

describe('SummarizationService', () => {
  let service: SummarizationService;
  let mockMcpClientService: jest.Mocked<MCPClientService>;
  let mockLogger: ReturnType<typeof mockServices.logger.mock>;

  const createService = (configOverrides: Record<string, any> = {}) => {
    const config = new ConfigReader({
      mcpChat: {
        conversationHistory: {
          autoSummarize: true,
          summarizeTimeout: 3000,
          ...configOverrides,
        },
      },
    });

    return new SummarizationService({
      mcpClientService: mockMcpClientService,
      logger: mockLogger,
      config,
    });
  };

  beforeEach(() => {
    mockMcpClientService = {
      initializeMCPServers: jest.fn(),
      processQuery: jest.fn(),
      getAvailableTools: jest.fn(),
      getProviderStatus: jest.fn(),
      getMCPServerStatus: jest.fn(),
    } as jest.Mocked<MCPClientService>;

    mockLogger = mockServices.logger.mock();
    service = createService();
  });

  describe('summarizeConversation', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'How do I deploy to Kubernetes?' },
      { role: 'assistant', content: 'You can use kubectl apply...' },
    ];

    it('should return LLM-generated title', async () => {
      mockMcpClientService.processQuery.mockResolvedValue({
        reply: 'Kubernetes Deployment Guide',
        toolCalls: [],
        toolResponses: [],
      });

      const title = await service.summarizeConversation(messages);

      expect(title).toBe('Kubernetes Deployment Guide');
      expect(mockMcpClientService.processQuery).toHaveBeenCalledTimes(1);
    });

    it('should sanitize HTML from title', async () => {
      mockMcpClientService.processQuery.mockResolvedValue({
        reply: '<script>alert("xss")</script>Test Title',
        toolCalls: [],
        toolResponses: [],
      });

      const title = await service.summarizeConversation(messages);

      expect(title).toBe('scriptalert(xss)/scriptTest Title');
    });

    it('should truncate long titles', async () => {
      const longTitle = 'A'.repeat(150);
      mockMcpClientService.processQuery.mockResolvedValue({
        reply: longTitle,
        toolCalls: [],
        toolResponses: [],
      });

      const title = await service.summarizeConversation(messages);

      expect(title.length).toBe(100);
    });

    it('should fall back to first message on LLM error', async () => {
      mockMcpClientService.processQuery.mockRejectedValue(
        new Error('LLM unavailable'),
      );

      const title = await service.summarizeConversation(messages);

      expect(title).toBe('How do I deploy to Kubernetes?');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should fall back to first message on timeout', async () => {
      // Create service with short timeout
      const shortTimeoutService = createService({ summarizeTimeout: 10 });

      mockMcpClientService.processQuery.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  reply: 'Late response',
                  toolCalls: [],
                  toolResponses: [],
                }),
              100,
            ),
          ),
      );

      const title = await shortTimeoutService.summarizeConversation(messages);

      // Should return fallback due to timeout
      expect(title).toBe('How do I deploy to Kubernetes?');
    });

    it('should return "Chat Session" for empty messages', async () => {
      const title = await service.summarizeConversation([]);

      expect(title).toBe('Chat Session');
      expect(mockMcpClientService.processQuery).not.toHaveBeenCalled();
    });

    it('should return fallback when autoSummarize is disabled', async () => {
      const disabledService = createService({ autoSummarize: false });

      const title = await disabledService.summarizeConversation(messages);

      expect(title).toBe('How do I deploy to Kubernetes?');
      expect(mockMcpClientService.processQuery).not.toHaveBeenCalled();
    });

    it('should truncate fallback title with ellipsis', async () => {
      const longMessages: ChatMessage[] = [
        {
          role: 'user',
          content:
            'This is a very long message that exceeds the fifty character limit for fallback titles',
        },
      ];
      mockMcpClientService.processQuery.mockRejectedValue(
        new Error('LLM unavailable'),
      );

      const title = await service.summarizeConversation(longMessages);

      expect(title).toBe('This is a very long message that exceeds the fi...');
      expect(title.length).toBe(50);
    });

    it('should extract only user messages for summarization', async () => {
      const conversationMessages: ChatMessage[] = [
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: 'First answer' },
        { role: 'user', content: 'Second question' },
        { role: 'assistant', content: 'Second answer' },
        { role: 'user', content: 'Third question' },
      ];

      mockMcpClientService.processQuery.mockResolvedValue({
        reply: 'Test Title',
        toolCalls: [],
        toolResponses: [],
      });

      await service.summarizeConversation(conversationMessages);

      const callArg = mockMcpClientService.processQuery.mock.calls[0][0];
      const messageContent = callArg[0].content;

      // Should only include user messages
      expect(messageContent).toContain('First question');
      expect(messageContent).toContain('Second question');
      expect(messageContent).toContain('Third question');
      expect(messageContent).not.toContain('First answer');
      expect(messageContent).not.toContain('Second answer');
    });
  });
});
