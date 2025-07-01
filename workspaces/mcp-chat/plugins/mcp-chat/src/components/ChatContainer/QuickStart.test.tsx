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

      // First render
      expect(
        mockConfigApiWithSuggestions.getOptionalConfigArray,
      ).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(
        <TestApiProvider apis={[[configApiRef, mockConfigApiWithSuggestions]]}>
          <ThemeProvider theme={mockTheme}>
            <QuickStart onSuggestionClick={mockOnSuggestionClick} />
          </ThemeProvider>
        </TestApiProvider>,
      );

      // Should not call config API again due to memoization
      expect(
        mockConfigApiWithSuggestions.getOptionalConfigArray,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('Interaction Handling', () => {
    it('accepts onSuggestionClick prop', () => {
      renderWithProviders(
        <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
        mockConfigApiWithSuggestions,
      );

      // Component should render without errors when callback is provided
      expect(screen.getByText('Code Analysis')).toBeInTheDocument();
    });

    it('handles missing onSuggestionClick gracefully', () => {
      expect(() => {
        renderWithProviders(
          <QuickStart onSuggestionClick={undefined as any} />,
          mockConfigApiWithSuggestions,
        );
      }).not.toThrow();
    });
  });

  describe('Component Props', () => {
    it('handles all required props', () => {
      expect(() => {
        renderWithProviders(
          <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
          mockConfigApiWithSuggestions,
        );
      }).not.toThrow();
    });

    it('validates suggestion structure', () => {
      const invalidConfigApi = {
        getOptionalConfigArray: jest.fn().mockReturnValue([
          {
            getString: jest.fn().mockImplementation((key: string) => {
              if (key === 'title') return 'Valid Title';
              if (key === 'description') return 'Valid Description';
              if (key === 'prompt') return 'Valid Prompt';
              if (key === 'category') return 'Valid Category';
              return '';
            }),
          },
        ]),
      };

      expect(() => {
        renderWithProviders(
          <QuickStart onSuggestionClick={mockOnSuggestionClick} />,
          invalidConfigApi,
        );
      }).not.toThrow();
    });
  });
});
