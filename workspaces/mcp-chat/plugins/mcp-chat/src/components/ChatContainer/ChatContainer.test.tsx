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
import { ChatMessage, MCPServerType } from '../../types';
import { useApiRequest, useToolApproval } from '../../hooks';
import { extractLastToolRequests } from '../../utils';

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

jest.mock('./ToolCallCard', () => ({
  ToolCallCard: ({
    toolCall,
    approvalStatus,
    serverName,
    onApprove,
    onReject,
    toolResult,
  }: any) => (
    <div data-testid="tool-call-card">
      <span data-testid="tool-call-name">{toolCall.function.name}</span>
      <span data-testid="tool-call-status">{approvalStatus}</span>
      <span data-testid="tool-call-server">{serverName}</span>
      {toolResult && <span data-testid="tool-call-result">{toolResult}</span>}
      <button
        data-testid={`approve-${toolCall.id}`}
        onClick={() => onApprove(toolCall.id)}
      >
        Approve
      </button>
      <button
        data-testid={`reject-${toolCall.id}`}
        onClick={() => onReject(toolCall.id)}
      >
        Reject
      </button>
    </div>
  ),
}));

jest.mock('../../hooks', () => ({
  useToolApproval: jest.fn(),
  useApiRequest: jest.fn(),
}));

jest.mock('../../utils', () => ({
  extractLastToolRequests: jest.fn(),
}));

const mockMcpChatApi = {
  sendChatMessage: jest.fn(),
  sendApprovedToolCalls: jest.fn(),
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
  setToolRequests: jest.fn(),
};

const mockUseApiRequest = {
  isTyping: false,
  execute: jest.fn(),
  cancelOngoingRequest: jest.fn(),
};

const mockUseToolApproval = {
  approve: jest.fn(),
  reject: jest.fn(),
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
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: 'Hello',
      metadata: {
        id: '1',
        timestamp: new Date(1).toISOString(),
      },
    },
    {
      role: 'assistant',
      content: 'Hi there!',
      metadata: {
        id: '2',
        timestamp: new Date(2).toISOString(),
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockScrollIntoView.mockClear();
    mockMcpChatApi.sendChatMessage.mockResolvedValue({
      messages,
      conversationId: 'conv-123',
    });
    (useApiRequest as jest.Mock).mockReturnValue(mockUseApiRequest);
    (useToolApproval as jest.Mock).mockReturnValue(mockUseToolApproval);
  });

  describe('rendering', () => {
    it('renders QuickStart when no messages', () => {
      renderChatContainer();

      expect(screen.getByTestId('quick-start')).toBeInTheDocument();
      expect(screen.getByText('Test Suggestion')).toBeInTheDocument();
    });

    it('renders messages when messages exist', () => {
      renderChatContainer({ messages });

      const messageElements = screen.getAllByTestId('chat-message');
      expect(messageElements).toHaveLength(2);
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('renders assistant tool_calls as ToolCallCards', () => {
      const toolMessages: ChatMessage[] = [
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'c1',
              type: 'function',
              function: { name: 'search', arguments: '{}' },
              metadata: { serverId: '1', approval_status: 'approved' },
            },
            {
              id: 'c2',
              type: 'function',
              function: { name: 'fetch', arguments: '{}' },
              metadata: { serverId: '1', approval_status: 'pending' },
            },
          ],
          metadata: { id: 'a1', timestamp: new Date(1).toISOString() },
        },
      ];

      renderChatContainer({ messages: toolMessages });

      const cards = screen.getAllByTestId('tool-call-card');
      expect(cards).toHaveLength(2);
      expect(screen.getByText('search')).toBeInTheDocument();
      expect(screen.getByText('fetch')).toBeInTheDocument();
    });

    it('resolves server name for tool call cards', () => {
      const toolMessages: ChatMessage[] = [
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'c1',
              type: 'function',
              function: { name: 'search', arguments: '{}' },
              metadata: { serverId: '1', approval_status: 'approved' },
            },
          ],
          metadata: { id: 'a1', timestamp: new Date(1).toISOString() },
        },
      ];

      renderChatContainer({ messages: toolMessages });

      expect(screen.getByText('test-server')).toBeInTheDocument();
    });

    it('shows tool result on ToolCallCard when tool response exists', () => {
      const toolMessages: ChatMessage[] = [
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'c1',
              type: 'function',
              function: { name: 'search', arguments: '{}' },
              metadata: { serverId: '1', approval_status: 'approved' },
            },
          ],
          metadata: { id: 'a1', timestamp: new Date(1).toISOString() },
        },
        {
          role: 'tool',
          content: 'found 3 cats',
          tool_call_id: 'c1',
          metadata: { id: 't1', timestamp: new Date(2).toISOString() },
        },
      ];

      renderChatContainer({ messages: toolMessages });

      expect(screen.getByTestId('tool-call-result')).toHaveTextContent(
        'found 3 cats',
      );
    });

    it('does not render tool or system messages directly', () => {
      const mixedMessages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are helpful',
          metadata: { id: 's1', timestamp: new Date(1).toISOString() },
        },
        {
          role: 'user',
          content: 'Hi',
          metadata: { id: 'u1', timestamp: new Date(2).toISOString() },
        },
        {
          role: 'tool',
          content: 'result',
          tool_call_id: 'c1',
          metadata: { id: 't1', timestamp: new Date(3).toISOString() },
        },
      ];

      renderChatContainer({ messages: mixedMessages });

      const chatMessages = screen.getAllByTestId('chat-message');
      expect(chatMessages).toHaveLength(1);
      expect(screen.getByText('Hi')).toBeInTheDocument();
      expect(screen.queryByText('You are helpful')).not.toBeInTheDocument();
      expect(screen.queryByText('result')).not.toBeInTheDocument();
    });
  });

  describe('message sending', () => {
    it('clears input after sending', async () => {
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

    it('calls execute with api callback on send', async () => {
      renderChatContainer();

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      expect(mockUseApiRequest.execute).toHaveBeenCalledTimes(1);

      const apiCall = mockUseApiRequest.execute.mock.calls[0][0];
      const controller = new AbortController();
      await apiCall(controller.signal);

      expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalledWith(
        [],
        'Hello world',
        ['1'],
        controller.signal,
        undefined,
      );
    });

    it('onSuccess updates messages and conversation', async () => {
      const onMessagesChange = jest.fn();
      const onConversationUpdated = jest.fn();
      const setToolRequests = jest.fn();

      const mockResponse = {
        messages: messages,
        conversationId: 'conv-1',
      };

      renderChatContainer({
        onMessagesChange,
        onConversationUpdated,
        setToolRequests,
      });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: messages[0].content } });
      fireEvent.click(sendButton!);

      expect(onMessagesChange).toHaveBeenCalledTimes(1);
      expect(onMessagesChange).toHaveBeenCalledWith([
        {
          role: 'user',
          content: messages[0].content,
          metadata: {
            id: expect.any(String),
            timestamp: expect.any(String),
          },
        },
      ]);

      const onSuccess = mockUseApiRequest.execute.mock.calls[0][1];
      act(() => onSuccess(mockResponse));

      expect(onConversationUpdated).toHaveBeenCalledTimes(1);
      expect(onConversationUpdated).toHaveBeenCalledWith('conv-1');
      expect(onMessagesChange).toHaveBeenCalledTimes(2);
      expect(onMessagesChange).toHaveBeenCalledWith(messages);
    });

    it('sets tool requests when response has pending tool calls', () => {
      const setToolRequests = jest.fn();
      const pendingRequests = { call_1: 'pending' as const };
      (extractLastToolRequests as jest.Mock).mockReturnValue(pendingRequests);

      const mockResponse = {
        messages,
        conversationId: 'conv-1',
      };

      renderChatContainer({ setToolRequests });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.click(sendButton!);

      const onSuccess = mockUseApiRequest.execute.mock.calls[0][1];
      act(() => onSuccess(mockResponse));

      expect(extractLastToolRequests).toHaveBeenCalledWith(messages);
      expect(setToolRequests).toHaveBeenCalledWith(pendingRequests);
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

    it('shows typing indicator', () => {
      (useApiRequest as jest.Mock).mockReturnValue({
        ...mockUseApiRequest,
        isTyping: true,
      });

      renderChatContainer({ messages });

      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
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

      expect(mockUseApiRequest.execute).toHaveBeenCalledTimes(1);
      const apiCall = mockUseApiRequest.execute.mock.calls[0][0];
      const controller = new AbortController();
      await apiCall(controller.signal);

      expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalledWith(
        expect.any(Array),
        'Hello world',
        ['1', '3'],
        controller.signal,
        undefined,
      );
    });
  });

  describe('approval', () => {
    const pendingMessages: ChatMessage[] = [
      {
        role: 'user',
        content: 'Search cats',
        metadata: { id: '1', timestamp: new Date(1).toISOString() },
      },
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'call_1',
            type: 'function',
            function: { name: 'search', arguments: '{}' },
            metadata: { serverId: 's1', approval_status: 'pending' },
          },
        ],
        metadata: { id: '2', timestamp: new Date(2).toISOString() },
      },
    ];

    const getOnComplete = (): ((decisions: Record<string, string>) => void) => {
      return (useToolApproval as jest.Mock).mock.calls[0][2];
    };

    it('calls sendApprovedToolCalls via execute on approval complete', async () => {
      renderChatContainer({ messages: pendingMessages });

      const onComplete = getOnComplete();
      await act(async () => onComplete({ call_1: 'approved' }));

      expect(mockUseApiRequest.execute).toHaveBeenCalledTimes(1);

      const apiCall = mockUseApiRequest.execute.mock.calls[0][0];
      const controller = new AbortController();
      await apiCall(controller.signal);

      expect(mockMcpChatApi.sendApprovedToolCalls).toHaveBeenCalledWith(
        pendingMessages,
        { call_1: 'approved' },
        controller.signal,
        undefined,
      );
    });

    it('passes conversationId to sendApprovedToolCalls', async () => {
      renderChatContainer({
        messages: pendingMessages,
        conversationId: 'conv-42',
      });

      const onComplete = getOnComplete();
      await act(async () => onComplete({ call_1: 'approved' }));

      const apiCall = mockUseApiRequest.execute.mock.calls[0][0];
      const controller = new AbortController();
      await apiCall(controller.signal);

      expect(mockMcpChatApi.sendApprovedToolCalls).toHaveBeenCalledWith(
        pendingMessages,
        { call_1: 'approved' },
        controller.signal,
        'conv-42',
      );
    });

    it('clears tool requests after approval complete', async () => {
      const setToolRequests = jest.fn();
      renderChatContainer({ messages: pendingMessages, setToolRequests });

      const onComplete = getOnComplete();
      await act(async () => onComplete({ call_1: 'approved' }));

      expect(setToolRequests).toHaveBeenCalledWith(undefined);
    });

    it('handles approval errors and clears tool requests', async () => {
      const onMessagesChange = jest.fn();
      const setToolRequests = jest.fn();
      renderChatContainer({
        messages: pendingMessages,
        onMessagesChange,
        setToolRequests,
      });

      const onComplete = getOnComplete();
      await act(async () => onComplete({ call_1: 'approved' }));

      const onError = mockUseApiRequest.execute.mock.calls[0][2];
      act(() => onError(new Error('500 Server Error')));

      expect(onMessagesChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'assistant',
            content: 'Error: 500 Server Error',
          }),
        ]),
      );
      expect(setToolRequests).toHaveBeenCalledWith(undefined);
    });
  });

  describe('QuickStart integration', () => {
    it('sends message when suggestion is clicked', async () => {
      const onMessagesChange = jest.fn();

      renderChatContainer({ onMessagesChange });

      const suggestionButton = screen.getByText('Test Suggestion');
      fireEvent.click(suggestionButton);

      expect(mockUseApiRequest.execute).toHaveBeenCalledTimes(1);
      const apiCall = mockUseApiRequest.execute.mock.calls[0][0];
      const controller = new AbortController();
      await apiCall(controller.signal);

      expect(mockMcpChatApi.sendChatMessage).toHaveBeenCalledWith(
        [],
        'Test suggestion',
        ['1'],
        expect.any(AbortSignal),
        undefined,
      );
    });
  });

  describe('error handling', () => {
    it('handles API errors gracefully', async () => {
      const onMessagesChange = jest.fn();

      renderChatContainer({ onMessagesChange });

      const input = screen.getByPlaceholderText('Message Assistant...');
      const sendButton = screen.getByTestId('SendIcon').closest('button');

      fireEvent.change(input, { target: { value: 'Hello world' } });
      fireEvent.click(sendButton!);

      expect(onMessagesChange).toHaveBeenCalledTimes(1);

      expect(mockUseApiRequest.execute).toHaveBeenCalledTimes(1);
      const apiCall = mockUseApiRequest.execute.mock.calls[0][2];
      const testError = new Error('404');
      await apiCall(testError);

      expect(onMessagesChange).toHaveBeenCalledTimes(2);
      expect(onMessagesChange).toHaveBeenCalledWith([
        {
          role: 'user',
          content: 'Hello world',
          metadata: {
            id: expect.any(String),
            timestamp: expect.any(String),
          },
        },
        {
          role: 'assistant',
          content:
            'The MCP Chat service is not available. Please check if the backend is running.',
          metadata: {
            id: expect.any(String),
            timestamp: expect.any(String),
          },
        },
      ]);
    });
  });

  describe('request cancellation', () => {
    it('exposes cancel function through ref', () => {
      const { ref } = renderChatContainer();

      expect(ref.current).toHaveProperty('cancelOngoingRequest');
      expect(typeof ref.current?.cancelOngoingRequest).toBe('function');
    });

    it('cancels ongoing request when called', async () => {
      const { ref } = renderChatContainer();

      act(() => {
        ref.current?.cancelOngoingRequest();
      });

      expect(mockUseApiRequest.cancelOngoingRequest).toHaveBeenCalledTimes(1);
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
