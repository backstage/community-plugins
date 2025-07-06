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
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ChatContainer, type ChatContainerRef } from './ChatContainer';
import { mcpChatApiRef } from '../../api';

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
      type: 'stdio',
      hasUrl: false,
      hasNpxCommand: true,
      hasScriptPath: false,
    },
  ],
  messages: [],
  setMessages: jest.fn(),
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

    it('renders input field and send button', () => {
      renderChatContainer();

      expect(
        screen.getByPlaceholderText('Message Assistant...'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('SendIcon')).toBeInTheDocument();
    });

    it('adjusts layout based on sidebar state', () => {
      const { rerender } = renderChatContainer({ sidebarCollapsed: true });

      rerender(
        <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
          <ThemeProvider theme={createTheme()}>
            <ChatContainer {...defaultProps} sidebarCollapsed={false} />
          </ThemeProvider>
        </TestApiProvider>,
      );

      expect(
        screen.getByPlaceholderText('Message Assistant...'),
      ).toBeInTheDocument();
    });
  });

  describe('message sending', () => {
    it('sends message when send button is clicked', async () => {
      const setMessages = jest.fn();

      renderChatContainer({ setMessages });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Hello world' }],
        ['test-server'],
        expect.any(AbortSignal),
      );
    });

    it('sends message when Enter key is pressed', async () => {
      const setMessages = jest.fn();

      renderChatContainer({ setMessages });

      const input = screen.getByPlaceholderText('Message Assistant...');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalled();
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

    it('clears input after sending message', async () => {
      renderChatContainer();

      const input = screen.getByPlaceholderText(
        'Message Assistant...',
      ) as HTMLInputElement;
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('disables input and send button while typing', async () => {
      mockMcpChatApi.sendChatMessage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000)),
      );

      renderChatContainer();

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it('shows typing indicator while waiting for response', async () => {
      mockMcpChatApi.sendChatMessage.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100)),
      );

      // Start with existing messages so we don't show QuickStart
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

      act(() => {
        fireEvent.click(sendButton!);
      });

      await waitFor(() => {
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
      });
    });
  });

  describe('QuickStart integration', () => {
    it('sends message when suggestion is clicked', async () => {
      const setMessages = jest.fn();

      renderChatContainer({ setMessages });

      const suggestionButton = screen.getByText('Test Suggestion');
      fireEvent.click(suggestionButton);

      expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Test suggestion' }],
        ['test-server'],
        expect.any(AbortSignal),
      );
    });
  });

  describe('message state management', () => {
    it('adds user message to state when sending', async () => {
      const setMessages = jest.fn();

      renderChatContainer({ setMessages });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      expect(setMessages).toHaveBeenCalledWith(expect.any(Function));
    });

    it('adds bot response to state after API call', async () => {
      const setMessages = jest.fn();

      renderChatContainer({ setMessages });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(setMessages).toHaveBeenCalledTimes(2);
      });
    });

    it('includes enabled MCP servers in API call', async () => {
      const mcpServers = [
        { id: '1', name: 'server1', enabled: true, type: 'stdio' },
        { id: '2', name: 'server2', enabled: false, type: 'stdio' },
        { id: '3', name: 'server3', enabled: true, type: 'stdio' },
      ];

      renderChatContainer({ mcpServers });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalledWith(
        expect.any(Array),
        ['server1', 'server3'],
        expect.any(AbortSignal),
      );
    });
  });

  describe('error handling', () => {
    it('handles API errors gracefully', async () => {
      const setMessages = jest.fn();
      mockMcpChatApi.sendChatMessage.mockRejectedValue(new Error('API Error'));

      renderChatContainer({ setMessages });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(setMessages).toHaveBeenCalledWith(expect.any(Function));
      });
    });

    it('handles network errors with specific message', async () => {
      const setMessages = jest.fn();
      mockMcpChatApi.sendChatMessage.mockRejectedValue(
        new Error('Network error'),
      );

      renderChatContainer({ setMessages });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(setMessages).toHaveBeenCalledWith(expect.any(Function));
      });
    });

    it('handles 404 errors with specific message', async () => {
      const setMessages = jest.fn();
      mockMcpChatApi.sendChatMessage.mockRejectedValue(
        new Error('404 Not Found'),
      );

      renderChatContainer({ setMessages });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(setMessages).toHaveBeenCalledWith(expect.any(Function));
      });
    });
  });

  describe('request cancellation', () => {
    it('exposes cancel function through ref', () => {
      const { ref } = renderChatContainer();

      expect(ref.current).toHaveProperty('cancelOngoingRequest');
      expect(typeof ref.current?.cancelOngoingRequest).toBe('function');
    });

    it('cancels ongoing request when new request is made', async () => {
      let firstCallResolve: (value: any) => void;
      const firstCallPromise = new Promise(resolve => {
        firstCallResolve = resolve;
      });

      mockMcpChatApi.sendChatMessage
        .mockImplementationOnce(() => firstCallPromise)
        .mockResolvedValueOnce({
          content: 'Second response',
          toolsUsed: [],
          toolResponses: [],
        });

      const { ref } = renderChatContainer();

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      // First request
      fireEvent.change(input, { target: { value: 'First message' } });
      act(() => {
        fireEvent.click(sendButton!);
      });

      // Wait for first request to start
      await waitFor(() => {
        expect(input).toBeDisabled();
      });

      // Manually cancel the first request to simulate a new request
      act(() => {
        ref.current?.cancelOngoingRequest();
      });

      // Wait for input to be enabled again
      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });

      // Second request
      fireEvent.change(input, { target: { value: 'Second message' } });
      act(() => {
        fireEvent.click(sendButton!);
      });

      // Resolve the first promise (should be ignored)
      firstCallResolve!({
        content: 'First response',
        toolsUsed: [],
        toolResponses: [],
      });

      await waitFor(() => {
        expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalledTimes(2);
      });
    });

    it('cancels request when component unmounts', () => {
      const { unmount } = renderChatContainer();

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('auto-scrolling', () => {
    it('scrolls to bottom when new messages are added', () => {
      const messages = [
        { id: '1', text: 'Hello', isUser: true, timestamp: new Date() },
      ];

      const { rerender } = renderChatContainer({ messages });

      const newMessages = [
        ...messages,
        { id: '2', text: 'Hi there!', isUser: false, timestamp: new Date() },
      ];

      rerender(
        <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
          <ThemeProvider theme={createTheme()}>
            <ChatContainer {...defaultProps} messages={newMessages} />
          </ThemeProvider>
        </TestApiProvider>,
      );

      expect(mockScrollIntoView).toHaveBeenCalled();
    });
  });

  describe('input validation', () => {
    it('disables send button when input is empty', () => {
      renderChatContainer();

      const sendButton = screen.getByTestId('SendIcon').closest('button');
      expect(sendButton).toBeDisabled();
    });

    it('enables send button when input has content', async () => {
      renderChatContainer();

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello' } });

      expect(sendButton).toBeEnabled();
    });

    it('disables send button when input is only whitespace', async () => {
      renderChatContainer();

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: '   ' } });

      expect(sendButton).toBeDisabled();
    });
  });
});
