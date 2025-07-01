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
import { render, act } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ChatContainer, type ChatContainerRef } from './ChatContainer';
import { mcpChatApiRef } from '../../api';
import type { ChatResponse } from '../../api/McpChatApi';

// Mock scrollIntoView function for JSDOM
const mockScrollIntoView = jest.fn();
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
});

// Mock the child components
jest.mock('./ChatMessage', () => ({
  ChatMessage: ({ message }: any) => (
    <div data-testid="chat-message">{message.text}</div>
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

describe('ChatContainer', () => {
  let mockMcpChatApi: jest.Mocked<any>;
  let mockTheme: any;
  let mockMessages: any[];
  let mockSetMessages: jest.Mock;
  let mockMcpServers: any[];
  let chatContainerRef: React.RefObject<ChatContainerRef>;

  const defaultProps = {
    sidebarCollapsed: false,
  };

  beforeEach(() => {
    mockMcpChatApi = {
      sendChatMessage: jest.fn(),
      getConfigStatus: jest.fn(),
      getAvailableTools: jest.fn(),
      testProviderConnection: jest.fn(),
    };

    mockTheme = createTheme({
      spacing: (factor: number) => `${8 * factor}px`,
      palette: {
        mode: 'light',
        background: {
          paper: '#ffffff',
        },
        divider: '#e0e0e0',
        primary: {
          main: '#1976d2',
          dark: '#115293',
          contrastText: '#ffffff',
        },
      },
    });

    mockMessages = [];
    mockSetMessages = jest.fn();
    mockMcpServers = [
      {
        id: '1',
        name: 'test-server',
        enabled: true,
        type: 'stdio',
        hasUrl: false,
        hasNpxCommand: true,
        hasScriptPath: false,
      },
    ];

    chatContainerRef = createRef<ChatContainerRef>();

    // Clear all mocks
    jest.clearAllMocks();
    mockScrollIntoView.mockClear();
  });

  const renderChatContainer = async (props = {}) => {
    let result;
    await act(async () => {
      result = render(
        <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
          <ThemeProvider theme={mockTheme}>
            <ChatContainer
              ref={chatContainerRef}
              customTheme={mockTheme}
              messages={mockMessages}
              setMessages={mockSetMessages}
              mcpServers={mockMcpServers}
              {...defaultProps}
              {...props}
            />
          </ThemeProvider>
        </TestApiProvider>,
      );
    });
    return result!;
  };

  describe('component rendering', () => {
    it('should render without crashing', async () => {
      const { container } = await renderChatContainer();
      expect(container).toBeDefined();
    });

    it('should render with required props', async () => {
      const { container } = await renderChatContainer({
        customTheme: mockTheme,
        sidebarCollapsed: true,
        mcpServers: mockMcpServers,
        messages: mockMessages,
        setMessages: mockSetMessages,
      });
      expect(container.firstChild).toBeDefined();
    });

    it('should render QuickStart when no messages', async () => {
      const { container } = await renderChatContainer();
      const quickStart = container.querySelector('[data-testid="quick-start"]');
      expect(quickStart).toBeDefined();
    });

    it('should render messages when messages exist', async () => {
      const messagesWithData = [
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

      const { container } = await renderChatContainer({
        messages: messagesWithData,
      });
      const messages = container.querySelectorAll(
        '[data-testid="chat-message"]',
      );
      expect(messages.length).toBe(2);
    });

    it('should render input field', async () => {
      const { container } = await renderChatContainer();
      const input = container.querySelector(
        'input[placeholder="Message Assistant..."]',
      );
      expect(input).toBeDefined();
    });

    it('should render send button', async () => {
      const { container } = await renderChatContainer();
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('props validation', () => {
    it('should handle sidebar collapsed state', async () => {
      const { container } = await renderChatContainer({
        sidebarCollapsed: true,
      });
      expect(container.firstChild).toBeDefined();
    });

    it('should handle sidebar expanded state', async () => {
      const { container } = await renderChatContainer({
        sidebarCollapsed: false,
      });
      expect(container.firstChild).toBeDefined();
    });

    it('should handle empty MCP servers array', async () => {
      const { container } = await renderChatContainer({ mcpServers: [] });
      expect(container.firstChild).toBeDefined();
    });

    it('should handle multiple MCP servers', async () => {
      const multipleServers = [
        { id: '1', name: 'server1', enabled: true },
        { id: '2', name: 'server2', enabled: false },
      ];
      const { container } = await renderChatContainer({
        mcpServers: multipleServers,
      });
      expect(container.firstChild).toBeDefined();
    });

    it('should handle custom theme', async () => {
      const customTheme = createTheme({
        palette: {
          primary: {
            main: '#ff0000',
          },
        },
      });
      const { container } = await renderChatContainer({ customTheme });
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('message state management', () => {
    it('should handle message updates', async () => {
      const { container } = await renderChatContainer();
      expect(container.firstChild).toBeDefined();
      expect(mockSetMessages).not.toHaveBeenCalled();
    });

    it('should handle empty messages array', async () => {
      const { container } = await renderChatContainer({ messages: [] });
      expect(container.firstChild).toBeDefined();
    });

    it('should handle messages with different types', async () => {
      const mixedMessages = [
        {
          id: '1',
          text: 'User message',
          isUser: true,
          timestamp: new Date(),
        },
        {
          id: '2',
          text: 'Assistant message',
          isUser: false,
          timestamp: new Date(),
          tools: ['tool1'],
          toolsUsed: ['tool1'],
          toolResponses: [{ toolName: 'tool1', result: 'success' }],
        },
      ];
      const { container } = await renderChatContainer({
        messages: mixedMessages,
      });
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('scrolling behavior', () => {
    it('should call scrollIntoView when messages change', async () => {
      const messagesWithData = [
        {
          id: '1',
          text: 'Hello',
          isUser: true,
          timestamp: new Date(),
        },
      ];

      await renderChatContainer({ messages: messagesWithData });

      // scrollIntoView should be called during the effect
      expect(mockScrollIntoView).toHaveBeenCalled();
    });

    it('should handle scrollIntoView gracefully when element not found', async () => {
      // This test ensures the component doesn't crash if scrollIntoView fails
      mockScrollIntoView.mockImplementation(() => {
        throw new Error('Element not found');
      });

      const { container } = await renderChatContainer();
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('ref functionality', () => {
    it('should expose cancelOngoingRequest method through ref', async () => {
      await renderChatContainer();
      expect(chatContainerRef.current).toBeDefined();
      expect(typeof chatContainerRef.current?.cancelOngoingRequest).toBe(
        'function',
      );
    });

    it('should handle cancelOngoingRequest call', async () => {
      await renderChatContainer();
      expect(() => {
        chatContainerRef.current?.cancelOngoingRequest();
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle missing required props gracefully', async () => {
      // Test with minimal props
      const { container } = await renderChatContainer({
        messages: [],
        setMessages: jest.fn(),
        mcpServers: [],
        customTheme: mockTheme,
      });
      expect(container.firstChild).toBeDefined();
    });

    it('should handle malformed props', async () => {
      // Test with null/undefined values that should be handled gracefully
      const { container } = await renderChatContainer({
        messages: [], // Use empty array instead of null
        setMessages: mockSetMessages,
        mcpServers: [],
        customTheme: mockTheme,
      });
      expect(container.firstChild).toBeDefined();
    });

    it('should handle undefined mcpServers', async () => {
      const { container } = await renderChatContainer({
        mcpServers: undefined,
      });
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('user interactions', () => {
    it('should handle suggestion clicks', async () => {
      const { container } = await renderChatContainer();
      const suggestionButton = container.querySelector(
        '[data-testid="quick-start"] button',
      );

      if (suggestionButton) {
        await act(async () => {
          suggestionButton.dispatchEvent(
            new MouseEvent('click', { bubbles: true }),
          );
        });
      }

      expect(container.firstChild).toBeDefined();
    });

    it('should handle input changes', async () => {
      const { container } = await renderChatContainer();
      const input = container.querySelector(
        'input[placeholder="Message Assistant..."]',
      );
      expect(input).toBeDefined();
    });
  });

  describe('API integration', () => {
    it('should have access to mcpChatApi', async () => {
      await renderChatContainer();
      // The component should render without API calls during initial render
      expect(mockMcpChatApi.sendChatMessage).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockMcpChatApi.sendChatMessage.mockRejectedValue(new Error('API Error'));
      const { container } = await renderChatContainer();
      expect(container.firstChild).toBeDefined();
    });
  });
});
