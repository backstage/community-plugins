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
import { NewChatButton } from './NewChatButton';

const renderWithTheme = (component: ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('NewChatButton', () => {
  it('renders the new chat button', () => {
    const onNewChat = jest.fn();
    renderWithTheme(<NewChatButton onNewChat={onNewChat} />);

    expect(screen.getByText('New Chat')).toBeInTheDocument();
    expect(screen.getByTestId('AddIcon')).toBeInTheDocument();
  });

  it('calls onNewChat when clicked', () => {
    const onNewChat = jest.fn();
    renderWithTheme(<NewChatButton onNewChat={onNewChat} />);

    const button = screen.getByText('New Chat');
    fireEvent.click(button);

    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('renders as a full-width button', () => {
    const onNewChat = jest.fn();
    renderWithTheme(<NewChatButton onNewChat={onNewChat} />);

    const button = screen.getByText('New Chat').closest('button');
    expect(button).toHaveClass('MuiButton-fullWidth');
  });

  it('has primary variant styling', () => {
    const onNewChat = jest.fn();
    renderWithTheme(<NewChatButton onNewChat={onNewChat} />);

    const button = screen.getByText('New Chat').closest('button');
    expect(button).toHaveClass('MuiButton-contained');
  });
});
