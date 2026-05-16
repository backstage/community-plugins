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
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ConversationSearchBar } from './ConversationSearchBar';

const mockTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4CAF50' },
    text: { primary: '#333', secondary: '#666' },
    background: { paper: '#fff', default: '#f5f5f5' },
    divider: '#e0e0e0',
  },
  spacing: (factor: number) => `${8 * factor}px`,
});

const renderWithTheme = (component: ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

describe('ConversationSearchBar', () => {
  const mockOnChange = jest.fn();
  const mockOnClear = jest.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onClear: mockOnClear,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the search input', () => {
    renderWithTheme(<ConversationSearchBar {...defaultProps} />);

    expect(
      screen.getByPlaceholderText('Search conversations...'),
    ).toBeInTheDocument();
  });

  it('calls onChange after debounce delay', () => {
    renderWithTheme(<ConversationSearchBar {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search conversations...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should not be called immediately
    expect(mockOnChange).not.toHaveBeenCalled();

    // Fast-forward past debounce delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('shows clear button only when input has value', () => {
    renderWithTheme(<ConversationSearchBar {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search conversations...');

    // No clear button initially
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'test' } });

    // Clear button should appear
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    renderWithTheme(
      <ConversationSearchBar {...defaultProps} value="existing" />,
    );

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });
});
