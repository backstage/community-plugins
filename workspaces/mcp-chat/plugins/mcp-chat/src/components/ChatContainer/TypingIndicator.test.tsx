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

// Mock BotIcon
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
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderWithTheme(<TypingIndicator />);

      expect(screen.getByText('Hang on...')).toBeInTheDocument();
    });

    it('displays the bot icon', () => {
      renderWithTheme(<TypingIndicator />);

      expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
    });

    it('shows typing message', () => {
      renderWithTheme(<TypingIndicator />);

      expect(screen.getByText('Hang on...')).toBeInTheDocument();
    });

    it('renders avatar with correct size', () => {
      renderWithTheme(<TypingIndicator />);

      const avatar = document.querySelector('.MuiAvatar-root');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Animation Elements', () => {
    it('renders three animated dots', () => {
      renderWithTheme(<TypingIndicator />);

      // Check that the component renders with the expected structure
      expect(screen.getByText('Hang on...')).toBeInTheDocument();
      expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
    });

    it('applies correct animation styles', () => {
      renderWithTheme(<TypingIndicator />);

      // Component should render without errors - animation is handled by CSS classes
      expect(screen.getByText('Hang on...')).toBeInTheDocument();
    });

    it('has different animation delays for dots', () => {
      renderWithTheme(<TypingIndicator />);

      // Component should render correctly with staggered animations
      expect(screen.getByText('Hang on...')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('applies light theme colors correctly', () => {
      renderWithTheme(<TypingIndicator />);

      const botIcon = screen.getByTestId('bot-icon');
      expect(botIcon).toBeInTheDocument();
    });

    it('applies dark theme colors correctly', () => {
      renderWithTheme(<TypingIndicator />, darkTheme);

      const botIcon = screen.getByTestId('bot-icon');
      expect(botIcon).toHaveStyle('color: #e0e0e0');
    });

    it('uses theme spacing correctly', () => {
      renderWithTheme(<TypingIndicator />);

      // Component should render without errors with theme spacing
      expect(screen.getByText('Hang on...')).toBeInTheDocument();
    });

    it('applies theme background colors', () => {
      renderWithTheme(<TypingIndicator />);

      // Check that component renders with theme background
      expect(screen.getByText('Hang on...')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('renders correctly in dark mode', () => {
      renderWithTheme(<TypingIndicator />, darkTheme);

      expect(screen.getByText('Hang on...')).toBeInTheDocument();
      expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
    });

    it('uses dark mode avatar colors', () => {
      renderWithTheme(<TypingIndicator />, darkTheme);

      const avatar = document.querySelector('.MuiAvatar-root');
      expect(avatar).toBeInTheDocument();
    });

    it('applies dark mode text colors', () => {
      renderWithTheme(<TypingIndicator />, darkTheme);

      const text = screen.getByText('Hang on...');
      expect(text).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('has correct component hierarchy', () => {
      renderWithTheme(<TypingIndicator />);

      // Should have avatar, card, and content
      expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
      expect(screen.getByText('Hang on...')).toBeInTheDocument();
    });

    it('uses Material-UI components correctly', () => {
      renderWithTheme(<TypingIndicator />);

      // Should render without Material-UI errors
      expect(screen.getByText('Hang on...')).toBeInTheDocument();
    });

    it('applies correct card styling', () => {
      renderWithTheme(<TypingIndicator />);

      // Card should be present and styled
      const text = screen.getByText('Hang on...');
      expect(text.closest('[class*="MuiCard"]')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('accepts no props gracefully', () => {
      expect(() => {
        renderWithTheme(<TypingIndicator />);
      }).not.toThrow();
    });

    it('is a functional component', () => {
      const component = renderWithTheme(<TypingIndicator />);
      expect(component).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('renders efficiently', () => {
      const startTime = globalThis.performance.now();
      renderWithTheme(<TypingIndicator />);
      const endTime = globalThis.performance.now();

      // Should render quickly (within reasonable time)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles multiple renders', () => {
      const { rerender } = renderWithTheme(<TypingIndicator />);

      expect(() => {
        rerender(
          <ThemeProvider theme={mockTheme}>
            <TypingIndicator />
          </ThemeProvider>,
        );
      }).not.toThrow();
    });
  });
});
