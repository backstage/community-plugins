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
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ProviderStatus } from './ProviderStatus';

const mockTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4CAF50' },
    text: { primary: '#333', secondary: '#666' },
    background: { paper: '#fff', default: '#f5f5f5' },
    divider: '#e0e0e0',
    success: { main: '#4CAF50', dark: '#2e7d32', light: '#81c784' },
    error: { main: '#d32f2f' },
    warning: { main: '#ff9800' },
  },
  spacing: (factor: number) => `${8 * factor}px`,
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4CAF50' },
    text: { primary: '#fff', secondary: 'rgba(255, 255, 255, 0.7)' },
    background: { paper: '#121212', default: '#000' },
    divider: '#333',
    success: { main: '#4CAF50', dark: '#2e7d32', light: '#81c784' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
  },
  spacing: (factor: number) => `${8 * factor}px`,
});

const renderWithTheme = (component: ReactElement, theme = mockTheme) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ProviderStatus', () => {
  const mockConnectedProviderData = {
    providers: [
      {
        id: 'provider-1',
        model: 'gpt-4',
        baseUrl: 'https://api.openai.com/v1',
        connection: {
          connected: true,
          models: ['gpt-4', 'gpt-3.5-turbo'],
        },
      },
    ],
    summary: {
      totalProviders: 1,
      healthyProviders: 1,
    },
    timestamp: '2025-01-01T00:00:00.000Z',
  };

  const mockDisconnectedProviderData = {
    providers: [
      {
        id: 'provider-1',
        model: 'gpt-4',
        baseUrl: 'https://api.openai.com/v1',
        connection: {
          connected: false,
          error: 'Connection failed: Network timeout',
        },
      },
    ],
    summary: {
      totalProviders: 1,
      healthyProviders: 0,
      error: 'Connection failed: Network timeout',
    },
    timestamp: '2025-01-01T00:00:00.000Z',
  };

  const mockMultipleModelsData = {
    providers: [
      {
        id: 'provider-1',
        model: 'gpt-4',
        baseUrl: 'https://api.openai.com/v1',
        connection: {
          connected: true,
          models: Array.from({ length: 10 }, (_, i) => `model-${i + 1}`),
        },
      },
    ],
    summary: {
      totalProviders: 1,
      healthyProviders: 1,
    },
    timestamp: '2025-01-01T00:00:00.000Z',
  };

  const mockLongModelNameData = {
    providers: [
      {
        id: 'provider-1',
        model: 'very-long-model-name-that-might-cause-layout-issues',
        baseUrl: 'https://api.openai.com/v1',
        connection: {
          connected: true,
          models: ['very-long-model-name-that-might-cause-layout-issues'],
        },
      },
    ],
    summary: {
      totalProviders: 1,
      healthyProviders: 1,
    },
    timestamp: '2025-01-01T00:00:00.000Z',
  };

  describe('Basic Rendering', () => {
    it('renders provider section title', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockConnectedProviderData}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByText('Provider')).toBeInTheDocument();
    });

    it('displays cloud icon', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockConnectedProviderData}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByTestId('CloudIcon')).toBeInTheDocument();
    });

    it('shows provider URL information', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockConnectedProviderData}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByText(/URL:/)).toBeInTheDocument();
      expect(
        screen.getByText(/https:\/\/api\.openai\.com\/v1/),
      ).toBeInTheDocument();
    });

    it('shows model information', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockConnectedProviderData}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByText(/Model:/)).toBeInTheDocument();
      expect(screen.getByText(/gpt-4/)).toBeInTheDocument();
    });
  });

  describe('Connection Status Display', () => {
    it('shows connected status when provider is connected', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockConnectedProviderData}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('shows testing status when connection is loading', () => {
      renderWithTheme(
        <ProviderStatus providerStatusData={null} isLoading error={null} />,
      );

      expect(screen.getByText('Testing...')).toBeInTheDocument();
    });

    it('shows disconnected status when connection failed', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockDisconnectedProviderData}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('shows loading text for model and URL when loading', () => {
      renderWithTheme(
        <ProviderStatus providerStatusData={null} isLoading error={null} />,
      );

      expect(screen.getByText(/Loading\.\.\./)).toBeInTheDocument();
    });

    it('shows not available when no provider data', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={null}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByText(/Not available/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when connection fails', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockDisconnectedProviderData}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(
        screen.getByText(/Connection failed: Network timeout/),
      ).toBeInTheDocument();
    });

    it('does not show error section when connected', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockConnectedProviderData}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });

    it('shows error text when there is an error prop', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={null}
          isLoading={false}
          error="Provider configuration error"
        />,
      );

      expect(
        screen.getByText(/Provider configuration error/),
      ).toBeInTheDocument();
    });

    it('handles null provider data gracefully', () => {
      expect(() =>
        renderWithTheme(
          <ProviderStatus
            providerStatusData={null}
            isLoading={false}
            error={null}
          />,
        ),
      ).not.toThrow();
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator in status chip', () => {
      renderWithTheme(
        <ProviderStatus providerStatusData={null} isLoading error={null} />,
      );

      expect(screen.getByText('Testing...')).toBeInTheDocument();
    });

    it('shows loading text in model field', () => {
      renderWithTheme(
        <ProviderStatus providerStatusData={null} isLoading error={null} />,
      );

      expect(screen.getByText(/Loading\.\.\./)).toBeInTheDocument();
    });
  });

  describe('Theming', () => {
    it('adapts to light theme', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockConnectedProviderData}
          isLoading={false}
          error={null}
        />,
        mockTheme,
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('adapts to dark theme', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockConnectedProviderData}
          isLoading={false}
          error={null}
        />,
        darkTheme,
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('handles many models gracefully', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockMultipleModelsData}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('handles long model names', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockLongModelNameData}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  describe('Tooltip Functionality', () => {
    it('provides helpful tooltips for status', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockConnectedProviderData}
          isLoading={false}
          error={null}
        />,
      );

      const statusChip = screen
        .getByText('Connected')
        .closest('[data-mui-internal-clone-element]');
      expect(statusChip).toHaveAttribute('aria-label');
    });

    it('shows loading tooltip when testing', () => {
      renderWithTheme(
        <ProviderStatus providerStatusData={null} isLoading error={null} />,
      );

      const statusChip = screen
        .getByText('Testing...')
        .closest('[data-mui-internal-clone-element]');
      expect(statusChip).toHaveAttribute('aria-label');
    });

    it('shows error tooltip when disconnected', () => {
      renderWithTheme(
        <ProviderStatus
          providerStatusData={mockDisconnectedProviderData}
          isLoading={false}
          error={null}
        />,
      );

      const statusChip = screen
        .getByText('Disconnected')
        .closest('[data-mui-internal-clone-element]');
      expect(statusChip).toHaveAttribute('aria-label');
    });
  });
});
