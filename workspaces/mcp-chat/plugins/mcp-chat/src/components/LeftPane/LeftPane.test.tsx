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
import { LeftPane } from './LeftPane';
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
      { role: 'assistant', content: 'I am doing well!' },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'conv-2',
    userId: 'user:default/testuser',
    messages: [
      { role: 'user', content: 'What is the weather?' },
      { role: 'assistant', content: 'It is sunny.' },
    ],
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
];

describe('LeftPane', () => {
  const defaultProps = {
    collapsed: false,
    onToggle: jest.fn(),
    onNewChat: jest.fn(),
    conversations: mockConversations,
    conversationsLoading: false,
    conversationsError: undefined,
    onSelectConversation: jest.fn(),
    selectedConversationId: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders expanded pane with all components', () => {
      renderWithTheme(<LeftPane {...defaultProps} />);

      expect(screen.getByText('Chats')).toBeInTheDocument();
      expect(screen.getByText('New Chat')).toBeInTheDocument();
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
      expect(screen.getByText(/Hello, how are you\?/)).toBeInTheDocument();
    });

    it('renders collapsed pane with minimal UI', () => {
      renderWithTheme(<LeftPane {...defaultProps} collapsed />);

      expect(screen.queryByText('Chats')).not.toBeInTheDocument();
      expect(screen.queryByText('New Chat')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Recent Conversations'),
      ).not.toBeInTheDocument();
    });

    it('shows toggle button in collapsed state', () => {
      renderWithTheme(<LeftPane {...defaultProps} collapsed />);

      expect(screen.getByTestId('ChevronRightIcon')).toBeInTheDocument();
      expect(screen.getByTestId('AddIcon')).toBeInTheDocument();
    });

    it('shows different toggle icon when expanded', () => {
      renderWithTheme(<LeftPane {...defaultProps} collapsed={false} />);

      expect(screen.getByTestId('ChevronLeftIcon')).toBeInTheDocument();
    });
  });

  describe('toggle functionality', () => {
    it('calls onToggle when toggle button is clicked', () => {
      const onToggle = jest.fn();
      renderWithTheme(<LeftPane {...defaultProps} onToggle={onToggle} />);

      const toggleButton = screen
        .getByTestId('ChevronLeftIcon')
        .closest('button');
      fireEvent.click(toggleButton!);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('calls onToggle in collapsed state', () => {
      const onToggle = jest.fn();
      renderWithTheme(
        <LeftPane {...defaultProps} collapsed onToggle={onToggle} />,
      );

      const toggleButton = screen
        .getByTestId('ChevronRightIcon')
        .closest('button');
      fireEvent.click(toggleButton!);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('new chat functionality', () => {
    it('calls onNewChat when new chat button is clicked', () => {
      const onNewChat = jest.fn();
      renderWithTheme(<LeftPane {...defaultProps} onNewChat={onNewChat} />);

      const newChatButton = screen.getByText('New Chat');
      fireEvent.click(newChatButton);

      expect(onNewChat).toHaveBeenCalledTimes(1);
    });

    it('shows new chat icon button in collapsed state', () => {
      renderWithTheme(<LeftPane {...defaultProps} collapsed />);

      const addButton = screen.getByTestId('AddIcon').closest('button');
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveAttribute('title', 'New Chat');
    });

    it('calls onNewChat when collapsed icon is clicked', () => {
      const onNewChat = jest.fn();
      renderWithTheme(
        <LeftPane {...defaultProps} collapsed onNewChat={onNewChat} />,
      );

      const addButton = screen.getByTestId('AddIcon').closest('button');
      fireEvent.click(addButton!);

      expect(onNewChat).toHaveBeenCalledTimes(1);
    });
  });

  describe('conversation list', () => {
    it('displays all conversations', () => {
      renderWithTheme(<LeftPane {...defaultProps} />);

      expect(screen.getByText(/Hello, how are you\?/)).toBeInTheDocument();
      expect(screen.getByText(/What is the weather\?/)).toBeInTheDocument();
    });

    it('calls onSelectConversation when conversation is clicked', () => {
      const onSelectConversation = jest.fn();
      renderWithTheme(
        <LeftPane
          {...defaultProps}
          onSelectConversation={onSelectConversation}
        />,
      );

      const conversation = screen.getByText(/Hello, how are you\?/);
      fireEvent.click(conversation);

      expect(onSelectConversation).toHaveBeenCalledTimes(1);
      expect(onSelectConversation).toHaveBeenCalledWith(mockConversations[0]);
    });

    it('highlights selected conversation', () => {
      const { container } = renderWithTheme(
        <LeftPane {...defaultProps} selectedConversationId="conv-1" />,
      );

      // Check that the selected class is applied somewhere in the component
      const selectedElements = container.querySelectorAll('.Mui-selected');
      expect(selectedElements.length).toBeGreaterThan(0);
    });
  });

  describe('loading state', () => {
    it('shows loading indicator when loading', () => {
      renderWithTheme(
        <LeftPane {...defaultProps} conversationsLoading conversations={[]} />,
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('displays error message', () => {
      const errorMessage = 'Failed to load conversations';
      renderWithTheme(
        <LeftPane
          {...defaultProps}
          conversationsError={errorMessage}
          conversations={[]}
        />,
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no conversations', () => {
      renderWithTheme(<LeftPane {...defaultProps} conversations={[]} />);

      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });
  });

  describe('width transitions', () => {
    it('has correct width when expanded', () => {
      const { container } = renderWithTheme(<LeftPane {...defaultProps} />);

      const pane = container.firstChild as HTMLElement;
      expect(pane).toHaveStyle({ width: '280px' });
    });

    it('has correct width when collapsed', () => {
      const { container } = renderWithTheme(
        <LeftPane {...defaultProps} collapsed />,
      );

      const pane = container.firstChild as HTMLElement;
      expect(pane).toHaveStyle({ width: '60px' });
    });
  });
});
