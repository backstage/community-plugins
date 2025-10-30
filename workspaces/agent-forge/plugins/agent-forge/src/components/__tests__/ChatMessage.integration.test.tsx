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

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { ChatMessage } from '../ChatMessage';
import { Message } from '../../types';
import { identityApiRef, alertApiRef } from '@backstage/core-plugin-api';

// Mock APIs
const mockIdentityApi = {
  getProfileInfo: jest.fn().mockResolvedValue({
    displayName: 'Test User',
    email: 'test@example.com',
  }),
  getBackstageIdentity: jest.fn().mockResolvedValue({
    type: 'user',
    userEntityRef: 'user:default/test',
    ownershipEntityRefs: [],
  }),
  getCredentials: jest.fn().mockResolvedValue({}),
};

const mockAlertApi = {
  post: jest.fn(),
  alert$: jest.fn(),
};

describe('ChatMessage Integration Tests', () => {
  const mockUserMessage: Message = {
    messageId: 'user-msg-1',
    text: 'Hello, AI!',
    isUser: true,
    timestamp: '10:00 AM',
    isStreaming: false,
  };

  const mockBotMessage: Message = {
    messageId: 'bot-msg-1',
    text: 'Hello! How can I help you?',
    isUser: false,
    timestamp: '10:01 AM',
    isStreaming: false,
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderMessage = async (
    message: Message,
    executionPlanBuffer: Record<string, string> = {},
    autoExpandExecutionPlans: Set<string> = new Set(),
    isLastMessage: boolean = false,
  ) => {
    const apis = TestApiProvider.create({
      apis: [
        [identityApiRef, mockIdentityApi],
        [alertApiRef, mockAlertApi],
      ],
    });

    return renderInTestApp(
      <TestApiProvider apis={apis}>
        <ChatMessage
          message={message}
          botName="CAIPE"
          executionPlanBuffer={executionPlanBuffer}
          autoExpandExecutionPlans={autoExpandExecutionPlans}
          isLastMessage={isLastMessage}
        />
      </TestApiProvider>,
    );
  };

  describe('Basic Message Rendering', () => {
    test('should render user message', async () => {
      await renderMessage(mockUserMessage);
      
      expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
    });

    test('should render bot message', async () => {
      await renderMessage(mockBotMessage);
      
      expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
    });

    test('should display timestamp', async () => {
      await renderMessage(mockUserMessage);
      
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    });

    test('should display bot name for bot messages', async () => {
      await renderMessage(mockBotMessage);
      
      expect(screen.getByText('CAIPE')).toBeInTheDocument();
    });
  });

  describe('Execution Plan Display', () => {
    test('should show execution plan when buffer has content', async () => {
      const messageWithPlan = { ...mockBotMessage, messageId: 'msg-with-plan' };
      const buffer = {
        'msg-with-plan': 'Task 1: Analyze request\nTask 2: Generate response',
      };
      
      await renderMessage(messageWithPlan, buffer);
      
      // Execution plan header should be visible
      await waitFor(() => {
        expect(screen.getByText('📋 Execution Plan')).toBeInTheDocument();
      });
    });

    test('should not show execution plan when buffer is empty', async () => {
      await renderMessage(mockBotMessage, {});
      
      // Execution plan should not be visible
      expect(screen.queryByText('📋 Execution Plan')).not.toBeInTheDocument();
    });

    test('should expand execution plan when auto-expand is set', async () => {
      const messageWithPlan = { ...mockBotMessage, messageId: 'msg-expand' };
      const buffer = {
        'msg-expand': 'Task 1: Do something',
      };
      const autoExpand = new Set(['msg-expand']);
      
      await renderMessage(messageWithPlan, buffer, autoExpand);
      
      // Plan content should be visible
      await waitFor(() => {
        expect(screen.getByText(/Task 1: Do something/)).toBeInTheDocument();
      });
    });

    test('should toggle execution plan on click', async () => {
      const user = userEvent.setup();
      const messageWithPlan = { ...mockBotMessage, messageId: 'msg-toggle' };
      const buffer = {
        'msg-toggle': 'Task 1: Test toggle',
      };
      
      await renderMessage(messageWithPlan, buffer);
      
      // Find and click execution plan header
      const header = screen.getByText('📋 Execution Plan');
      await user.click(header);
      
      // Plan should expand
      await waitFor(() => {
        expect(screen.getByText(/Task 1: Test toggle/)).toBeInTheDocument();
      });
      
      // Click again to collapse
      await user.click(header);
      
      // Plan should collapse
      await waitFor(() => {
        expect(screen.queryByText(/Task 1: Test toggle/)).not.toBeVisible();
      });
    });

    test('should render markdown in execution plan', async () => {
      const messageWithPlan = { ...mockBotMessage, messageId: 'msg-markdown' };
      const buffer = {
        'msg-markdown': '**Bold text**\n*Italic text*\n- List item',
      };
      const autoExpand = new Set(['msg-markdown']);
      
      await renderMessage(messageWithPlan, buffer, autoExpand);
      
      // Markdown should be rendered
      await waitFor(() => {
        expect(screen.getByText('Bold text')).toBeInTheDocument();
        expect(screen.getByText('Italic text')).toBeInTheDocument();
        expect(screen.getByText('List item')).toBeInTheDocument();
      });
    });

    test('should isolate execution plans by messageId', async () => {
      const msg1 = { ...mockBotMessage, messageId: 'msg-1' };
      const buffer = {
        'msg-1': 'Plan for message 1',
        'msg-2': 'Plan for message 2', // Should not appear
      };
      
      await renderMessage(msg1, buffer);
      
      // Only plan for msg-1 should be visible
      await waitFor(() => {
        expect(screen.getByText('📋 Execution Plan')).toBeInTheDocument();
      });
      
      const autoExpand = new Set(['msg-1']);
      await renderMessage(msg1, buffer, autoExpand);
      
      await waitFor(() => {
        expect(screen.getByText(/Plan for message 1/)).toBeInTheDocument();
        expect(screen.queryByText(/Plan for message 2/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Message Actions', () => {
    test('should copy message to clipboard', async () => {
      const user = userEvent.setup();
      
      // Mock clipboard API
      Object.assign(window.navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });
      
      await renderMessage(mockBotMessage);
      
      // Find copy button
      const copyButton = screen.getByRole('button', { name: /copy/i });
      await user.click(copyButton);
      
      // Clipboard should be called
      await waitFor(() => {
        expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('Hello! How can I help you?');
      });
    });

    test('should show toast on successful copy', async () => {
      const user = userEvent.setup();
      
      Object.assign(window.navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });
      
      await renderMessage(mockBotMessage);
      
      const copyButton = screen.getByRole('button', { name: /copy/i });
      await user.click(copyButton);
      
      // Toast message should appear
      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Streaming Messages', () => {
    test('should show streaming indicator', async () => {
      const streamingMessage = {
        ...mockBotMessage,
        isStreaming: true,
        text: 'Generating response...',
      };
      
      await renderMessage(streamingMessage);
      
      // Should show streaming message
      expect(screen.getByText('Generating response...')).toBeInTheDocument();
    });

    test('should not auto-collapse if message is last', async () => {
      const completedMessage = {
        ...mockBotMessage,
        messageId: 'last-msg',
        isStreaming: false,
      };
      const buffer = {
        'last-msg': 'Execution plan content',
      };
      const autoExpand = new Set(['last-msg']);
      
      await renderMessage(completedMessage, buffer, autoExpand, true);
      
      // Plan should remain expanded (last message)
      await waitFor(() => {
        expect(screen.getByText(/Execution plan content/)).toBeInTheDocument();
      });
    });
  });

  describe('Message Content Formatting', () => {
    test('should render markdown links', async () => {
      const messageWithLink = {
        ...mockBotMessage,
        text: '[Click here](https://example.com)',
      };
      
      await renderMessage(messageWithLink);
      
      const link = screen.getByText('Click here');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', 'https://example.com');
    });

    test('should render code blocks', async () => {
      const messageWithCode = {
        ...mockBotMessage,
        text: '```javascript\nconst hello = "world";\n```',
      };
      
      await renderMessage(messageWithCode);
      
      await waitFor(() => {
        expect(screen.getByText(/const hello/)).toBeInTheDocument();
      });
    });

    test('should render inline code', async () => {
      const messageWithInlineCode = {
        ...mockBotMessage,
        text: 'Use the `console.log()` function',
      };
      
      await renderMessage(messageWithInlineCode);
      
      expect(screen.getByText('console.log()')).toBeInTheDocument();
    });

    test('should render lists', async () => {
      const messageWithList = {
        ...mockBotMessage,
        text: '- Item 1\n- Item 2\n- Item 3',
      };
      
      await renderMessage(messageWithList);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', async () => {
      await renderMessage(mockBotMessage);
      
      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toHaveAccessibleName();
    });

    test('should support keyboard navigation for actions', async () => {
      const user = userEvent.setup();
      
      Object.assign(window.navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });
      
      await renderMessage(mockBotMessage);
      
      // Tab to copy button
      await user.tab();
      const copyButton = screen.getByRole('button', { name: /copy/i });
      
      // Press Enter to copy
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(window.navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty message text', async () => {
      const emptyMessage = {
        ...mockBotMessage,
        text: '',
      };
      
      await renderMessage(emptyMessage);
      
      // Should render without crashing
      expect(screen.getByText('CAIPE')).toBeInTheDocument();
    });

    test('should handle very long messages', async () => {
      const longMessage = {
        ...mockBotMessage,
        text: 'A'.repeat(10000),
      };
      
      await renderMessage(longMessage);
      
      // Should render without crashing
      const content = screen.getByText(/A{1000,}/);
      expect(content).toBeInTheDocument();
    });

    test('should handle messages with special characters', async () => {
      const specialCharsMessage = {
        ...mockBotMessage,
        text: '<script>alert("XSS")</script>',
      };
      
      await renderMessage(specialCharsMessage);
      
      // Should sanitize and render safely
      expect(screen.getByText(/<script>/)).toBeInTheDocument();
    });

    test('should handle undefined messageId gracefully', async () => {
      const noIdMessage = {
        ...mockBotMessage,
        messageId: undefined,
      };
      
      await renderMessage(noIdMessage);
      
      // Should render without crashing
      expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should render quickly with large execution plan', async () => {
      const largePlan = `${'Task '.repeat(1000)  }Final task`;
      const messageWithLargePlan = { ...mockBotMessage, messageId: 'large-plan' };
      const buffer = {
        'large-plan': largePlan,
      };
      const autoExpand = new Set(['large-plan']);
      
      const startTime = Date.now();
      await renderMessage(messageWithLargePlan, buffer, autoExpand);
      const endTime = Date.now();
      
      // Should render in reasonable time (<1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/Final task/)).toBeInTheDocument();
      });
    });
  });
});

