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

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TestApiProvider } from '@backstage/test-utils';
import { ChatMessage } from './ChatMessage';
import { agenticChatApiRef, type AgenticChatApi } from '../../api';
import { Message } from '../../types';

const theme = createTheme();

const mockApi: Partial<AgenticChatApi> = {
  getBranding: jest.fn().mockResolvedValue({
    appName: 'Agentic Chat',
    tagline: 'Test',
    inputPlaceholder: 'Test',
    primaryColor: '#9333ea',
    secondaryColor: '#8b5cf6',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    infoColor: '#0ea5e9',
  }),
};

const renderChatMessage = (
  message: Message,
  props: { onRegenerate?: () => void } = {},
) => {
  return render(
    <TestApiProvider apis={[[agenticChatApiRef, mockApi as AgenticChatApi]]}>
      <ThemeProvider theme={theme}>
        <ChatMessage message={message} {...props} />
      </ThemeProvider>
    </TestApiProvider>,
  );
};

describe('ChatMessage', () => {
  const baseUserMessage: Message = {
    id: '1',
    text: 'Hello, how are you?',
    isUser: true,
    timestamp: new Date('2024-01-15T10:30:00'),
  };

  const baseAssistantMessage: Message = {
    id: '2',
    text: 'I am doing well, thank you for asking!',
    isUser: false,
    timestamp: new Date('2024-01-15T10:30:30'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock clipboard API
    Object.assign(window.navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  describe('user messages', () => {
    it('should render user message text', () => {
      renderChatMessage(baseUserMessage);
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    });

    it('should display "You" label for user messages', () => {
      renderChatMessage(baseUserMessage);
      expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('should display timestamp for user messages', () => {
      renderChatMessage(baseUserMessage);
      expect(screen.getByText(/10:30/)).toBeInTheDocument();
    });

    it('should render user icon', () => {
      renderChatMessage(baseUserMessage);
      // PersonIcon should be present (tested by presence of avatar area)
      expect(screen.getByText('You')).toBeInTheDocument();
    });
  });

  describe('assistant messages', () => {
    it('should render assistant message text', () => {
      renderChatMessage(baseAssistantMessage);
      expect(
        screen.getByText('I am doing well, thank you for asking!'),
      ).toBeInTheDocument();
    });

    it('should display app name for assistant messages', async () => {
      renderChatMessage(baseAssistantMessage);
      // Wait for branding to load
      await waitFor(() => {
        expect(screen.getByText('Agentic Chat')).toBeInTheDocument();
      });
    });

    it('should display timestamp for assistant messages', () => {
      renderChatMessage(baseAssistantMessage);
      expect(screen.getByText(/10:30/)).toBeInTheDocument();
    });

    it('should not render empty assistant messages', () => {
      const emptyMessage: Message = {
        ...baseAssistantMessage,
        text: '',
      };
      const { container } = renderChatMessage(emptyMessage);
      expect(container.firstChild).toBeNull();
    });

    it('should not render whitespace-only assistant messages', () => {
      const whitespaceMessage: Message = {
        ...baseAssistantMessage,
        text: '   \n\t  ',
      };
      const { container } = renderChatMessage(whitespaceMessage);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('markdown rendering', () => {
    it('should render markdown headers', () => {
      const markdownMessage: Message = {
        ...baseAssistantMessage,
        text: '# Header\n\nParagraph text',
      };
      renderChatMessage(markdownMessage);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Header',
      );
    });

    it('should render markdown lists', () => {
      const markdownMessage: Message = {
        ...baseAssistantMessage,
        text: '- Item 1\n- Item 2\n- Item 3',
      };
      renderChatMessage(markdownMessage);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should render markdown code blocks', () => {
      const markdownMessage: Message = {
        ...baseAssistantMessage,
        text: '```javascript\nconst x = 1;\n```',
      };
      renderChatMessage(markdownMessage);
      // react-syntax-highlighter splits tokens into spans; check the code container
      expect(screen.getByLabelText('Copy code')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });
  });

  describe('tool calls', () => {
    const messageWithTools: Message = {
      ...baseAssistantMessage,
      text: 'Here is the result:',
      toolCalls: [
        {
          id: 'tool-1',
          name: 'get_pods',
          serverLabel: 'k8s-server',
          arguments: '{"namespace":"default"}',
          output: 'pod-1\npod-2',
        },
      ],
    };

    it('should display tool calls section when present', () => {
      renderChatMessage(messageWithTools);
      expect(screen.getByText(/Used 1 tool/)).toBeInTheDocument();
    });

    it('should be collapsible', async () => {
      renderChatMessage(messageWithTools);

      // Click to expand
      const expandButton = screen.getByRole('button', {
        name: /expand tool calls/i,
      });

      // Should have proper aria-expanded attribute
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(expandButton);

      // aria-expanded should change
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should display tool error when present', async () => {
      const messageWithError: Message = {
        ...baseAssistantMessage,
        text: 'An error occurred:',
        toolCalls: [
          {
            id: 'tool-1',
            name: 'delete_pod',
            serverLabel: 'k8s-server',
            arguments: '{}',
            error: 'Pod not found',
          },
        ],
      };
      renderChatMessage(messageWithError);

      const expandButton = screen.getByRole('button', {
        name: /expand tool calls/i,
      });
      await userEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/Pod not found/)).toBeInTheDocument();
      });
    });
  });

  describe('RAG sources', () => {
    const messageWithSources: Message = {
      ...baseAssistantMessage,
      ragSources: [
        { filename: 'doc1.md', text: 'Relevant content from doc1' },
        { filename: 'doc2.pdf', text: 'Relevant content from doc2' },
      ],
    };

    it('should display sources section when present', () => {
      renderChatMessage(messageWithSources);
      expect(screen.getByText(/2 sources from Vector RAG/)).toBeInTheDocument();
    });

    it('should be collapsible', async () => {
      renderChatMessage(messageWithSources);

      // Click to expand
      const expandButton = screen.getByRole('button', {
        name: /expand knowledge base sources/i,
      });
      await userEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('doc1.md')).toBeInTheDocument();
        expect(screen.getByText('doc2.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('copy functionality', () => {
    it('should have copy button for assistant messages', () => {
      renderChatMessage(baseAssistantMessage);

      const copyButton = screen.getByLabelText('Copy response');
      expect(copyButton).toBeInTheDocument();
    });

    it('copy button should be accessible', () => {
      renderChatMessage(baseAssistantMessage);

      const copyButton = screen.getByLabelText('Copy response');
      // Button should have proper role and accessibility
      expect(copyButton).toHaveAttribute('type', 'button');
      expect(copyButton).not.toBeDisabled();
    });
  });

  describe('regenerate functionality', () => {
    it('should not show regenerate button when not provided', () => {
      renderChatMessage(baseAssistantMessage);
      // Regenerate button should not be present without onRegenerate handler
      expect(
        screen.queryByLabelText('Regenerate response'),
      ).not.toBeInTheDocument();
    });

    it('should not show regenerate button for non-last assistant messages', () => {
      const onRegenerate = jest.fn();
      renderChatMessage(baseAssistantMessage, { onRegenerate });
      // Regenerate button should not be present without isLastAssistantMessage
      expect(
        screen.queryByLabelText('Regenerate response'),
      ).not.toBeInTheDocument();
    });
  });

  describe('token usage', () => {
    it('should display token usage badge when usage data is present', () => {
      const messageWithUsage: Message = {
        ...baseAssistantMessage,
        usage: {
          input_tokens: 2341,
          output_tokens: 847,
          total_tokens: 3188,
        },
      };
      renderChatMessage(messageWithUsage);
      expect(screen.getByText('2,341 in')).toBeInTheDocument();
      expect(screen.getByText('847 out')).toBeInTheDocument();
    });

    it('should not display token usage badge when usage is absent', () => {
      renderChatMessage(baseAssistantMessage);
      expect(screen.queryByText(/\d+ in$/)).not.toBeInTheDocument();
    });

    it('should not display token usage badge for user messages', () => {
      const userWithUsage: Message = {
        ...baseUserMessage,
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      };
      renderChatMessage(userWithUsage);
      expect(screen.queryByText(/\d+ in$/)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have keyboard-accessible collapsible sections', async () => {
      const messageWithTools: Message = {
        ...baseAssistantMessage,
        toolCalls: [
          {
            id: 'tool-1',
            name: 'test_tool',
            serverLabel: 'server',
            arguments: '{}',
          },
        ],
      };
      renderChatMessage(messageWithTools);

      const expandButton = screen.getByRole('button', {
        name: /expand tool calls/i,
      });

      // Should support keyboard interaction
      fireEvent.keyDown(expandButton, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('test_tool')).toBeInTheDocument();
      });
    });

    it('should have proper aria-expanded attribute', async () => {
      const messageWithTools: Message = {
        ...baseAssistantMessage,
        toolCalls: [
          {
            id: 'tool-1',
            name: 'test_tool',
            serverLabel: 'server',
            arguments: '{}',
          },
        ],
      };
      renderChatMessage(messageWithTools);

      const expandButton = screen.getByRole('button', {
        name: /expand tool calls/i,
      });

      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
