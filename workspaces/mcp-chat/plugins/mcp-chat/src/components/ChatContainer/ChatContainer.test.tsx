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

import { createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ChatContainer, type ChatContainerRef } from './ChatContainer';
import { mcpChatApiRef } from '../../api';
import { MCPServerType } from '../../types';

const mockScrollIntoView = jest.fn();
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
});

jest.mock('./ChatMessage', () => ({
  ChatMessage: ({ message }: any) => (
    <div data-testid="chat-message">
      <span data-testid="message-text">{message.text}</span>
      <span data-testid="message-user">{message.isUser.toString()}</span>
    </div>
  ),
}));

jest.mock('./QuickStart', () => ({
  QuickStart: ({ onSuggestionClick }: any) => (
    <div data-testid="quick-start">
      <button onClick={() => onSuggestionClick('Test suggestion')}>
        Test Suggestion
      </button>
    </div>
  ),
}));

jest.mock('./TypingIndicator', () => ({
  TypingIndicator: () => <div data-testid="typing-indicator">Typing...</div>,
}));

const mockMcpChatApi = {
  sendChatMessage: jest.fn(),
  getConfigStatus: jest.fn(),
  getAvailableTools: jest.fn(),
  testProviderConnection: jest.fn(),
};

const defaultProps = {
  sidebarCollapsed: false,
  mcpServers: [
    {
      id: '1',
      name: 'test-server',
      enabled: true,
      type: MCPServerType.STDIO,
      hasUrl: false,
      hasNpxCommand: true,
      hasScriptPath: false,
    },
  ],
  messages: [],
  onMessagesChange: jest.fn(),
};

const renderChatContainer = (props = {}) => {
  const theme = createTheme();
  const ref = createRef<ChatContainerRef>();

  return {
    ref,
    ...render(
      <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
        <ThemeProvider theme={theme}>
          <ChatContainer ref={ref} {...defaultProps} {...props} />
        </ThemeProvider>
      </TestApiProvider>,
    ),
  };
};

describe('ChatContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScrollIntoView.mockClear();
    mockMcpChatApi.sendChatMessage.mockResolvedValue({
      content: 'Test response',
      toolsUsed: [],
      toolResponses: [],
    });
  });

  describe('rendering', () => {
    it('renders QuickStart when no messages', () => {
      renderChatContainer();

      expect(screen.getByTestId('quick-start')).toBeInTheDocument();
      expect(screen.getByText('Test Suggestion')).toBeInTheDocument();
    });

    it('renders messages when messages exist', () => {
      const messages = [
        {
          id: '1',
          text: 'Hello',
          isUser: true,
          timestamp: new Date(),
        },
        {
          id: '2',
          text: 'Hi there!',
          isUser: false,
          timestamp: new Date(),
        },
      ];

      renderChatContainer({ messages });

      const messageElements = screen.getAllByTestId('chat-message');
      expect(messageElements).toHaveLength(2);
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });
  });

  describe('message sending', () => {
    it('sends message and clears input', async () => {
      const onMessagesChange = jest.fn();
      renderChatContainer({ onMessagesChange });

      const input = screen.getByPlaceholderText(
        'Message Assistant...',
      ) as HTMLInputElement;
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Hello world' }],
        ['1'],
        expect.any(AbortSignal),
      );

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('does not send message when Shift+Enter is pressed', async () => {
      renderChatContainer();

      const input = screen.getByPlaceholderText('Message Assistant...');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.keyPress(input, {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
        shiftKey: true,
      });

      expect(mockMcpChatApi.sendChatMessage).not.toHaveBeenCalled();
    });

    it('shows typing indicator while waiting for response', async () => {
      mockMcpChatApi.sendChatMessage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100)),
      );

      const messages = [
        {
          id: '1',
          text: 'Previous message',
          isUser: true,
          timestamp: new Date(),
        },
      ];

      renderChatContainer({ messages });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
      });
    });

    it('includes only enabled MCP servers in API call', async () => {
      const mcpServers = [
        { id: '1', name: 'server1', enabled: true, type: MCPServerType.STDIO },
        { id: '2', name: 'server2', enabled: false, type: MCPServerType.STDIO },
        { id: '3', name: 'server3', enabled: true, type: MCPServerType.STDIO },
      ];

      renderChatContainer({ mcpServers });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalledWith(
        expect.any(Array),
        ['1', '3'],
        expect.any(AbortSignal),
      );
    });
  });

  describe('QuickStart integration', () => {
    it('sends message when suggestion is clicked', async () => {
      const onMessagesChange = jest.fn();

      renderChatContainer({ onMessagesChange });

      const suggestionButton = screen.getByText('Test Suggestion');
      fireEvent.click(suggestionButton);

      expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Test suggestion' }],
        ['1'],
        expect.any(AbortSignal),
      );
    });
  });

  describe('error handling', () => {
    it('handles API errors gracefully', async () => {
      const onMessagesChange = jest.fn();
      mockMcpChatApi.sendChatMessage.mockRejectedValue(new Error('API Error'));

      renderChatContainer({ onMessagesChange });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(onMessagesChange).toHaveBeenCalled();
      });
    });
  });

  describe('request cancellation', () => {
    it('exposes cancel function through ref', () => {
      const { ref } = renderChatContainer();

      expect(ref.current).toHaveProperty('cancelOngoingRequest');
      expect(typeof ref.current?.cancelOngoingRequest).toBe('function');
    });

    it('cancels ongoing request when called', async () => {
      const firstCallPromise = new Promise(() => {});

      mockMcpChatApi.sendChatMessage.mockImplementationOnce(
        () => firstCallPromise,
      );

      const { ref } = renderChatContainer();

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'First message' } });
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(input).toBeDisabled();
      });

      // Wrap the cancellation in act to handle state updates
      await waitFor(() => {
        ref.current?.cancelOngoingRequest();
      });

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('input validation', () => {
    it('disables send button when input is empty or whitespace', () => {
      renderChatContainer();

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      expect(sendButton).toBeDisabled();

      fireEvent.change(input, { target: { value: '   ' } });
      expect(sendButton).toBeDisabled();

      fireEvent.change(input, { target: { value: 'Hello' } });
      expect(sendButton).toBeEnabled();
    });
  });
});
