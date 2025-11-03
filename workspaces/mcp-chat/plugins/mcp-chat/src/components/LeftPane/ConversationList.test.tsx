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
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ConversationList } from './ConversationList';
import { ConversationRecord } from '../../types';

const renderWithTheme = (component: ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockConversations: ConversationRecord[] = [
  {
    id: 'conv-1',
    userId: 'user:default/testuser',
    messages: [
      { role: 'user', content: 'Hello, how are you?' },
      { role: 'assistant', content: 'I am doing well, thank you!' },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'conv-2',
    userId: 'user:default/testuser',
    messages: [
      { role: 'user', content: 'What is the weather like today?' },
      { role: 'assistant', content: 'It is sunny and warm.' },
    ],
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'conv-3',
    userId: 'user:default/testuser',
    messages: [
      { role: 'user', content: 'Tell me a joke' },
      { role: 'assistant', content: 'Why did the chicken cross the road?' },
    ],
    createdAt: '2025-01-03T00:00:00.000Z',
    updatedAt: '2025-01-03T00:00:00.000Z',
  },
];

describe('ConversationList', () => {
  const defaultProps = {
    conversations: mockConversations,
    loading: false,
    error: undefined,
    onSelectConversation: jest.fn(),
    selectedConversationId: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the section title', () => {
      renderWithTheme(<ConversationList {...defaultProps} />);
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });

    it('renders all conversations', () => {
      renderWithTheme(<ConversationList {...defaultProps} />);

      expect(screen.getByText(/Hello, how are you\?/)).toBeInTheDocument();
      expect(
        screen.getByText(/What is the weather like today\?/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Tell me a joke/)).toBeInTheDocument();
    });

    it('truncates long conversation previews', () => {
      const longConversation: ConversationRecord = {
        id: 'conv-long',
        userId: 'user:default/testuser',
        messages: [
          {
            role: 'user',
            content:
              'This is a very long message that should be truncated because it exceeds the character limit',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      renderWithTheme(
        <ConversationList
          {...defaultProps}
          conversations={[longConversation]}
        />,
      );

      // Check for the truncated text (first 50 chars)
      expect(
        screen.getByText(/This is a very long message that should be trun/),
      ).toBeInTheDocument();
      // Verify it shows ellipsis
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });

    it('displays conversation dates', () => {
      renderWithTheme(<ConversationList {...defaultProps} />);

      // Check that dates are rendered (format may vary by locale)
      const dates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dates.length).toBeGreaterThan(0);
    });
  });

  describe('loading state', () => {
    it('shows loading spinner when loading with no conversations', () => {
      renderWithTheme(
        <ConversationList {...defaultProps} loading conversations={[]} />,
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(
        screen.queryByText(/Hello, how are you\?/),
      ).not.toBeInTheDocument();
    });

    it('does not show loading spinner when refetching with cached conversations', () => {
      renderWithTheme(
        <ConversationList
          {...defaultProps}
          loading
          conversations={mockConversations}
        />,
      );

      // Should NOT show loading spinner
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      // Should show cached conversations
      expect(screen.getByText(/Hello, how are you\?/)).toBeInTheDocument();
      expect(
        screen.getByText(/What is the weather like today\?/),
      ).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('displays error message when error is present', () => {
      const errorMessage = 'Failed to load conversations';
      renderWithTheme(
        <ConversationList
          {...defaultProps}
          error={errorMessage}
          conversations={[]}
        />,
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(
        screen.queryByText(/Hello, how are you\?/),
      ).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no conversations', () => {
      renderWithTheme(
        <ConversationList {...defaultProps} conversations={[]} />,
      );

      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('highlights selected conversation', () => {
      const { container } = renderWithTheme(
        <ConversationList {...defaultProps} selectedConversationId="conv-2" />,
      );

      // Check that the selected class is applied somewhere in the component
      const selectedElements = container.querySelectorAll('.Mui-selected');
      expect(selectedElements.length).toBeGreaterThan(0);
    });

    it('calls onSelectConversation when conversation is clicked', () => {
      const onSelectConversation = jest.fn();
      renderWithTheme(
        <ConversationList
          {...defaultProps}
          onSelectConversation={onSelectConversation}
        />,
      );

      const conversation = screen.getByText(/Hello, how are you\?/);
      fireEvent.click(conversation);

      expect(onSelectConversation).toHaveBeenCalledTimes(1);
      expect(onSelectConversation).toHaveBeenCalledWith(mockConversations[0]);
    });
  });

  describe('empty conversation handling', () => {
    it('shows placeholder text for conversations without user messages', () => {
      const emptyConversation: ConversationRecord = {
        id: 'conv-empty',
        userId: 'user:default/testuser',
        messages: [{ role: 'assistant', content: 'Hello!' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      renderWithTheme(
        <ConversationList
          {...defaultProps}
          conversations={[emptyConversation]}
        />,
      );

      expect(screen.getByText('Empty conversation')).toBeInTheDocument();
    });
  });
});
