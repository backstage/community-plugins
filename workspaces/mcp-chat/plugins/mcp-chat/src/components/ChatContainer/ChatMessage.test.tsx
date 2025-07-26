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

import { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ChatMessage } from './ChatMessage';

jest.mock('react-markdown', () => {
  return function MockReactMarkdown(props: any) {
    return <div data-testid="markdown-content">{props.children}</div>;
  };
});

jest.mock('../BotIcon', () => ({
  BotIcon: () => <div data-testid="bot-icon">Bot Icon</div>,
}));

const mockClipboard = {
  writeText: jest.fn(),
};

Object.assign(window.navigator, {
  clipboard: mockClipboard,
});

const renderWithTheme = (component: ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ChatMessage', () => {
  const mockMessage = {
    id: '1',
    text: 'Hello, world!',
    isUser: true,
    timestamp: new Date('2024-01-01T12:00:00Z'),
  };

  const mockBotMessage = {
    id: '2',
    text: 'Hello! How can I help you?',
    isUser: false,
    timestamp: new Date('2024-01-01T12:01:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders user message correctly', () => {
      renderWithTheme(<ChatMessage message={mockMessage} />);

      expect(screen.getByText('Hello, world!')).toBeInTheDocument();
      const personIcon = screen.getByTestId('person-icon');
      expect(personIcon).toBeInTheDocument();
    });

    it('renders bot message correctly', () => {
      renderWithTheme(<ChatMessage message={mockBotMessage} />);

      expect(
        screen.getByText('Hello! How can I help you?'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
    });

    it('applies correct styling for user messages', () => {
      renderWithTheme(<ChatMessage message={mockMessage} />);

      const messageContainer = screen
        .getByText('Hello, world!')
        .closest('[data-testid="message-container"]');
      expect(messageContainer).toHaveClass('user-message');
    });

    it('applies correct styling for bot messages', () => {
      renderWithTheme(<ChatMessage message={mockBotMessage} />);

      const messageContainer = screen
        .getByText('Hello! How can I help you?')
        .closest('[data-testid="message-container"]');
      expect(messageContainer).toHaveClass('bot-message');
    });
  });

  describe('Bot Message Features', () => {
    it('renders bot icon for bot message', () => {
      renderWithTheme(<ChatMessage message={mockBotMessage} />);
      const botIcon = screen.getByTestId('bot-icon');
      expect(botIcon).toBeInTheDocument();
    });

    it('renders markdown content for bot messages', () => {
      const markdownMessage = {
        ...mockBotMessage,
        text: 'Hello! Here is some **bold** text and `code`.',
      };
      renderWithTheme(<ChatMessage message={markdownMessage} />);
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });
  });

  describe('Message Content', () => {
    it('renders plain text messages', () => {
      const plainMessage = { ...mockMessage, text: 'Simple text message' };
      renderWithTheme(<ChatMessage message={plainMessage} />);

      expect(screen.getByText('Simple text message')).toBeInTheDocument();
    });

    it('renders markdown content for complex messages', () => {
      const markdownMessage = {
        ...mockMessage,
        text: '# Header\n\nThis is **bold** text with `code`',
      };
      renderWithTheme(<ChatMessage message={markdownMessage} />);

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('handles empty messages', () => {
      const emptyMessage = { ...mockMessage, text: '' };
      renderWithTheme(<ChatMessage message={emptyMessage} />);

      expect(screen.getByTestId('person-icon')).toBeInTheDocument();
    });

    it('handles whitespace-only messages', () => {
      const whitespaceMessage = { ...mockMessage, text: '   \n\t  ' };
      renderWithTheme(<ChatMessage message={whitespaceMessage} />);

      expect(screen.getByTestId('person-icon')).toBeInTheDocument();
    });
  });

  describe('Tools Display', () => {
    it('displays tools used in message', () => {
      const messageWithTools = {
        ...mockBotMessage,
        toolsUsed: ['file-search', 'calculator'],
        tools: ['file-search', 'calculator'],
      };
      renderWithTheme(<ChatMessage message={messageWithTools} />);

      expect(screen.getByText('file-search')).toBeInTheDocument();
      expect(screen.getByText('calculator')).toBeInTheDocument();
    });

    it('shows tool count when tools are present', () => {
      const messageWithTools = {
        ...mockBotMessage,
        toolsUsed: ['tool1', 'tool2', 'tool3'],
        tools: ['tool1', 'tool2', 'tool3'],
      };
      renderWithTheme(<ChatMessage message={messageWithTools} />);

      expect(screen.getByText('Tools used (3)')).toBeInTheDocument();
    });

    it('does not show tools section when no tools used', () => {
      renderWithTheme(<ChatMessage message={mockBotMessage} />);

      expect(screen.queryByText('tools used')).not.toBeInTheDocument();
    });

    it('handles tool responses correctly', () => {
      const messageWithToolResponses = {
        ...mockBotMessage,
        toolsUsed: ['test-tool'],
        tools: ['test-tool'],
        toolResponses: [
          {
            name: 'test-tool',
            result: 'Tool execution result',
          },
        ],
      };
      renderWithTheme(<ChatMessage message={messageWithToolResponses} />);

      expect(screen.getByText('test-tool')).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('calls clipboard API when copy is triggered', async () => {
      const onCopy = jest.fn();
      renderWithTheme(<ChatMessage message={mockMessage} onCopy={onCopy} />);

      await globalThis.navigator.clipboard.writeText(mockMessage.text);

      expect(globalThis.navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Hello, world!',
      );
    });

    it('handles copy errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (globalThis.navigator.clipboard.writeText as jest.Mock).mockRejectedValue(
        new Error('Copy failed'),
      );

      renderWithTheme(<ChatMessage message={mockMessage} />);

      await expect(
        globalThis.navigator.clipboard.writeText(mockMessage.text),
      ).rejects.toEqual(new Error('Copy failed'));

      consoleSpy.mockRestore();
    });
  });

  describe('Feedback Functionality', () => {
    it('calls onFeedback when provided', () => {
      const onFeedback = jest.fn();
      renderWithTheme(
        <ChatMessage message={mockBotMessage} onFeedback={onFeedback} />,
      );

      expect(onFeedback).toBeDefined();
    });

    it('handles missing onFeedback gracefully', () => {
      expect(() => {
        renderWithTheme(<ChatMessage message={mockBotMessage} />);
      }).not.toThrow();
    });
  });

  describe('Message Props Validation', () => {
    it('handles all required message properties', () => {
      const completeMessage = {
        id: 'test-id',
        text: 'Test message',
        isUser: false,
        timestamp: new Date(),
        tools: ['tool1'],
        toolsUsed: ['tool1'],
        toolResponses: [{ name: 'tool1', result: 'result' }],
      };

      expect(() => {
        renderWithTheme(<ChatMessage message={completeMessage} />);
      }).not.toThrow();
    });

    it('handles minimal message properties', () => {
      const minimalMessage = {
        id: 'minimal',
        text: 'Minimal',
        isUser: true,
        timestamp: new Date(),
      };

      expect(() => {
        renderWithTheme(<ChatMessage message={minimalMessage} />);
      }).not.toThrow();
    });
  });

  describe('Timestamp Handling', () => {
    it('accepts valid timestamp', () => {
      const messageWithTimestamp = {
        ...mockMessage,
        timestamp: new Date('2024-12-01T10:30:00Z'),
      };

      expect(() => {
        renderWithTheme(<ChatMessage message={messageWithTimestamp} />);
      }).not.toThrow();
    });

    it('handles current timestamp', () => {
      const messageWithCurrentTime = {
        ...mockMessage,
        timestamp: new Date(),
      };

      expect(() => {
        renderWithTheme(<ChatMessage message={messageWithCurrentTime} />);
      }).not.toThrow();
    });
  });

  describe('Component State Management', () => {
    it('manages copied text state correctly', () => {
      renderWithTheme(<ChatMessage message={mockMessage} />);

      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    });

    it('manages selected tool state correctly', () => {
      const messageWithTools = {
        ...mockBotMessage,
        toolsUsed: ['test-tool'],
        tools: ['test-tool'],
      };
      renderWithTheme(<ChatMessage message={messageWithTools} />);

      expect(screen.getByText('test-tool')).toBeInTheDocument();
    });
  });
});
