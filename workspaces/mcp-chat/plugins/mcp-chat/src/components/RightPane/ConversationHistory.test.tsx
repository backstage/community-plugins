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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ConversationHistory } from './ConversationHistory';
import type { ConversationRecord } from '../../types';

const mockTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4CAF50' },
    text: { primary: '#333', secondary: '#666' },
    background: { paper: '#fff', default: '#f5f5f5' },
    divider: '#e0e0e0',
    action: {
      selected: 'rgba(0, 0, 0, 0.08)',
      hover: 'rgba(0, 0, 0, 0.04)',
    },
    warning: { main: '#ff9800' },
    error: { main: '#f44336' },
  },
  spacing: (factor: number) => `${8 * factor}px`,
});

const renderWithTheme = (component: ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

describe('ConversationHistory', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnSearchClear = jest.fn();
  const mockOnSelectConversation = jest.fn();
  const mockOnToggleStar = jest.fn();
  const mockOnDelete = jest.fn();

  const createConversation = (
    id: string,
    title: string,
    isStarred = false,
  ): ConversationRecord => ({
    id,
    userId: 'user:default/test-user',
    title,
    messages: [
      { role: 'user', content: `Message for ${title}` },
      { role: 'assistant', content: 'Response' },
    ],
    toolsUsed: [],
    isStarred,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const starredConversations: ConversationRecord[] = [
    createConversation('starred-1', 'Important Chat', true),
  ];

  const recentConversations: ConversationRecord[] = [
    createConversation('recent-1', 'Recent Chat 1'),
    createConversation('recent-2', 'Recent Chat 2'),
  ];

  const defaultProps = {
    starredConversations: [],
    recentConversations: [],
    loading: false,
    error: undefined,
    searchQuery: '',
    onSearchChange: mockOnSearchChange,
    onSearchClear: mockOnSearchClear,
    onSelectConversation: mockOnSelectConversation,
    onToggleStar: mockOnToggleStar,
    onDelete: mockOnDelete,
    selectedConversationId: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search bar and conversations', () => {
    renderWithTheme(
      <ConversationHistory
        {...defaultProps}
        starredConversations={starredConversations}
        recentConversations={recentConversations}
      />,
    );

    expect(
      screen.getByPlaceholderText('Search conversations...'),
    ).toBeInTheDocument();
    expect(screen.getByText('Starred')).toBeInTheDocument();
    expect(screen.getByText('Important Chat')).toBeInTheDocument();
    expect(screen.getByText('Recent Chat 1')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    renderWithTheme(<ConversationHistory {...defaultProps} loading />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error message when error is present', () => {
    renderWithTheme(
      <ConversationHistory
        {...defaultProps}
        error="Failed to load conversations"
      />,
    );

    expect(
      screen.getByText('Failed to load conversations'),
    ).toBeInTheDocument();
  });

  it('shows empty state when no conversations', () => {
    renderWithTheme(<ConversationHistory {...defaultProps} />);

    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });

  it('shows no results when search has no matches', () => {
    renderWithTheme(
      <ConversationHistory {...defaultProps} searchQuery="nonexistent" />,
    );

    expect(screen.getByText('No conversations found')).toBeInTheDocument();
  });

  it('calls onSelectConversation when conversation is clicked', () => {
    renderWithTheme(
      <ConversationHistory
        {...defaultProps}
        recentConversations={recentConversations}
      />,
    );

    fireEvent.click(screen.getByText('Recent Chat 1'));

    expect(mockOnSelectConversation).toHaveBeenCalledWith(
      recentConversations[0],
    );
  });

  it('calls onToggleStar when star button is clicked', () => {
    renderWithTheme(
      <ConversationHistory
        {...defaultProps}
        recentConversations={recentConversations}
      />,
    );

    const listItems = screen.getAllByRole('listitem');
    fireEvent.mouseEnter(listItems[0]);
    fireEvent.click(screen.getByLabelText('Add to favorites'));

    expect(mockOnToggleStar).toHaveBeenCalledWith('recent-1');
  });

  it('calls onDelete when delete is confirmed', () => {
    renderWithTheme(
      <ConversationHistory
        {...defaultProps}
        recentConversations={recentConversations}
      />,
    );

    const listItems = screen.getAllByRole('listitem');
    fireEvent.mouseEnter(listItems[0]);
    fireEvent.click(screen.getByLabelText('Delete conversation'));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(mockOnDelete).toHaveBeenCalledWith('recent-1');
  });
});
