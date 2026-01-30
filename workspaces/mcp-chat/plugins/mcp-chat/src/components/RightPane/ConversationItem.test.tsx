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
import { ConversationItem } from './ConversationItem';
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

describe('ConversationItem', () => {
  const mockOnSelect = jest.fn();
  const mockOnToggleStar = jest.fn();
  const mockOnDelete = jest.fn();

  const baseConversation: ConversationRecord = {
    id: 'conv-123',
    userId: 'user:default/test-user',
    title: 'Test Conversation',
    messages: [
      { role: 'user', content: 'Hello there' },
      { role: 'assistant', content: 'Hi! How can I help?' },
    ],
    toolsUsed: ['search_tool'],
    isStarred: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultProps = {
    conversation: baseConversation,
    isSelected: false,
    onSelect: mockOnSelect,
    onToggleStar: mockOnToggleStar,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays conversation title', () => {
    renderWithTheme(<ConversationItem {...defaultProps} />);

    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
  });

  it('displays first user message when no title', () => {
    const conversationWithoutTitle: ConversationRecord = {
      ...baseConversation,
      title: undefined,
    };

    renderWithTheme(
      <ConversationItem
        {...defaultProps}
        conversation={conversationWithoutTitle}
      />,
    );

    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    renderWithTheme(<ConversationItem {...defaultProps} />);

    fireEvent.click(screen.getByText('Test Conversation'));

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('shows action buttons on hover and calls onToggleStar', () => {
    renderWithTheme(<ConversationItem {...defaultProps} />);

    // No buttons before hover
    expect(screen.queryByLabelText('Add to favorites')).not.toBeInTheDocument();

    // Hover to show buttons
    fireEvent.mouseEnter(screen.getByRole('listitem'));

    const starButton = screen.getByLabelText('Add to favorites');
    expect(starButton).toBeInTheDocument();

    fireEvent.click(starButton);

    expect(mockOnToggleStar).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('shows action buttons when selected without hover', () => {
    renderWithTheme(<ConversationItem {...defaultProps} isSelected />);

    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete conversation')).toBeInTheDocument();
  });

  it('opens delete confirmation and calls onDelete when confirmed', () => {
    renderWithTheme(<ConversationItem {...defaultProps} />);

    fireEvent.mouseEnter(screen.getByRole('listitem'));
    fireEvent.click(screen.getByLabelText('Delete conversation'));

    // Confirmation should appear
    expect(
      screen.getByText(
        /Delete this conversation\? This action cannot be undone\./,
      ),
    ).toBeInTheDocument();

    // Confirm delete
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});
