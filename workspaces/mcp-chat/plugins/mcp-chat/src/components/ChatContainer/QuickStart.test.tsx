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

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { TestApiProvider } from '@backstage/test-utils';
import { configApiRef } from '@backstage/core-plugin-api';
import { QuickStart } from './QuickStart';

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

const renderWithProviders = (
  component: React.ReactElement,
  configApi: any,
  theme = mockTheme,
) => {
  return render(
    <TestApiProvider apis={[[configApiRef, configApi]]}>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </TestApiProvider>,
  );
};

describe('QuickStart', () => {
  const mockOnSuggestionClick = jest.fn();

  const mockSuggestions = [
    {
      title: 'Code Analysis',
      description: 'Analyze code quality and structure',
      prompt: 'Analyze my code for potential improvements',
      category: 'Development',
    },
    {
      title: 'Database Query',
      description: 'Help with database operations',
      prompt: 'Help me write a SQL query',
      category: 'Database',
    },
    {
      title: 'Security Scan',
      description: 'Check for security vulnerabilities',
      prompt: 'Scan my project for security issues',
      category: 'Security',
    },
  ];

  const mockConfigApi = {
    getOptionalConfigArray: jest.fn(),
  };

  const mockConfigApiWithSuggestions = {
    getOptionalConfigArray: jest.fn().mockReturnValue(
      mockSuggestions.map(suggestion => ({
        getString: jest.fn(
          (key: string) => suggestion[key as keyof typeof suggestion],
        ),
      })),
    ),
  };

  const mockConfigApiEmpty = {
    getOptionalConfigArray: jest.fn().mockReturnValue([]),
  };

  const mockConfigApiNull = {
    getOptionalConfigArray: jest.fn().mockReturnValue(null),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders main heading', () => {
      renderWithProviders(
        <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
        mockConfigApiEmpty,
      );

      expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      renderWithProviders(
        <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
        mockConfigApiEmpty,
      );

      expect(
        screen.getByText(/Explore powerful AI-assisted workflows/),
      ).toBeInTheDocument();
    });

    it('renders without suggestions when config is empty', () => {
      renderWithProviders(
        <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
        mockConfigApiEmpty,
      );

      expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
      expect(screen.queryByText('Code Analysis')).not.toBeInTheDocument();
    });

    it('renders without suggestions when config is null', () => {
      renderWithProviders(
        <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
        mockConfigApiNull,
      );

      expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
      expect(screen.queryByText('Code Analysis')).not.toBeInTheDocument();
    });
  });

  describe('Suggestions Rendering', () => {
    it('renders all suggestions from config', () => {
      renderWithProviders(
        <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
        mockConfigApiWithSuggestions,
      );

      expect(screen.getByText('Code Analysis')).toBeInTheDocument();
      expect(screen.getByText('Database Query')).toBeInTheDocument();
      expect(screen.getByText('Security Scan')).toBeInTheDocument();
    });

    it('renders suggestion descriptions', () => {
      renderWithProviders(
        <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
        mockConfigApiWithSuggestions,
      );

      expect(
        screen.getByText('Analyze code quality and structure'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Help with database operations'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Check for security vulnerabilities'),
      ).toBeInTheDocument();
    });

    it('renders category chips', () => {
      renderWithProviders(
        <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
        mockConfigApiWithSuggestions,
      );

      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });
  });

  describe('Configuration Handling', () => {
    it('calls config API with correct key', () => {
      renderWithProviders(
        <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
        mockConfigApi,
      );

      expect(mockConfigApi.getOptionalConfigArray).toHaveBeenCalledWith(
        'mcpChat.quickPrompts',
      );
    });

    it('handles config API errors gracefully', () => {
      const errorConfigApi = {
        getOptionalConfigArray: jest.fn().mockImplementation(() => {
          throw new Error('Config error');
        }),
      };

      expect(() => {
        renderWithProviders(
          <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
          errorConfigApi,
        );
      }).not.toThrow();
    });

    it('memoizes suggestions correctly', () => {
      const { rerender } = renderWithProviders(
        <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
        mockConfigApiWithSuggestions,
      );

      expect(
        mockConfigApiWithSuggestions.getOptionalConfigArray,
      ).toHaveBeenCalledTimes(1);

      rerender(
        <TestApiProvider apis={[[configApiRef, mockConfigApiWithSuggestions]]}>
          <ThemeProvider theme={mockTheme}>
            <QuickStart onSuggestionClick={mockOnSuggestionClick} />
          </ThemeProvider>
        </TestApiProvider>,
      );

      expect(
        mockConfigApiWithSuggestions.getOptionalConfigArray,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('Interaction Handling', () => {
    it('calls onSuggestionClick when suggestion card is clicked', () => {
      const onSuggestionClick = jest.fn();
      renderWithProviders(
        <QuickStart onSuggestionClick={onSuggestionClick} />,
        mockConfigApiWithSuggestions,
      );

      // Find the card container by its title text and simulate click
      const suggestionTitle = screen.getByText('Code Analysis');
      // The Card component is rendered, we need to traverse up to find the clickable element
      const cardContent = suggestionTitle.closest('[class*="MuiCardContent"]');
      const card = cardContent?.parentElement;

      expect(card).toBeTruthy();
      if (card) {
        fireEvent.click(card);
      }

      expect(onSuggestionClick).toHaveBeenCalledWith(
        'Analyze my code for potential improvements',
      );
    });
  });
});
