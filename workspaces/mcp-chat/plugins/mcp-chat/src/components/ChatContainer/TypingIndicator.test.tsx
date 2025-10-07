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

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { TypingIndicator } from './TypingIndicator';

jest.mock('../BotIcon', () => ({
  BotIcon: ({ color }: { color?: string }) => (
    <div data-testid="bot-icon" style={{ color }}>
      Bot Icon
    </div>
  ),
}));

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

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4CAF50' },
    text: { primary: '#fff', secondary: '#b3b3b3' },
    background: { paper: '#1e1e1e', default: '#121212' },
    divider: '#333',
  },
  spacing: (factor: number) => `${8 * factor}px`,
});

const renderWithTheme = (component: React.ReactElement, theme = mockTheme) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('TypingIndicator', () => {
  it('renders with all required elements', () => {
    renderWithTheme(<TypingIndicator />);

    expect(screen.getByText('Hang on...')).toBeInTheDocument();
    expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
    expect(document.querySelector('.MuiAvatar-root')).toBeInTheDocument();
  });

  it('applies dark theme colors correctly', () => {
    renderWithTheme(<TypingIndicator />, darkTheme);

    const botIcon = screen.getByTestId('bot-icon');
    expect(botIcon).toHaveStyle('color: rgb(255, 255, 255)');
  });
});
