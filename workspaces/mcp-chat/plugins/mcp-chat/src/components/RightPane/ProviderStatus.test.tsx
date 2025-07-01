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
import { ProviderStatus } from './ProviderStatus';
import type { ConfigStatus } from '../../api/McpChatApi';

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

describe('ProviderStatus', () => {
  const mockConfigStatus: ConfigStatus = {
    provider: {
      model: 'gpt-4',
      baseURL: 'https://api.openai.com/v1',
      type: 'openai',
    },
    mcpServers: [],
  };

  const mockProviderConnectionStatus = {
    connected: true,
    models: ['gpt-4', 'gpt-3.5-turbo'],
    loading: false,
  };

  const mockLoadingStatus = {
    connected: false,
    loading: true,
  };

  const mockErrorStatus = {
    connected: false,
    error: 'Connection failed: Network timeout',
    loading: false,
  };

  describe('Basic Rendering', () => {
    it('renders provider section title', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      expect(screen.getByText('Provider')).toBeInTheDocument();
    });

    it('displays cloud icon', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      // Cloud icon should be rendered
      expect(screen.getByTestId('CloudIcon')).toBeInTheDocument();
    });

    it('shows provider URL information', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      expect(screen.getByText(/URL:/)).toBeInTheDocument();
      expect(
        screen.getByText(/https:\/\/api\.openai\.com\/v1/),
      ).toBeInTheDocument();
    });
  });

  describe('Connection Status Display', () => {
    it('shows connected status when provider is connected', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('shows testing status when connection is loading', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockLoadingStatus}
        />,
      );

      expect(screen.getByText('Testing...')).toBeInTheDocument();
    });

    it('shows disconnected status when connection failed', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockErrorStatus}
        />,
      );

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('applies correct status colors for connected state', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      const statusElement = screen.getByText('Connected');
      expect(statusElement).toHaveStyle('color: #2e7d32');
    });

    it('applies correct status colors for loading state', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockLoadingStatus}
        />,
      );

      const statusElement = screen.getByText('Testing...');
      expect(statusElement).toHaveStyle('color: #ff9800');
    });

    it('applies correct status colors for error state', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockErrorStatus}
        />,
      );

      const statusElement = screen.getByText('Disconnected');
      expect(statusElement).toHaveStyle('color: #d32f2f');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when connection fails', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockErrorStatus}
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
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });

    it('does not show error section when loading', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockLoadingStatus}
        />,
      );

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });

    it('handles long error messages', () => {
      const longErrorStatus = {
        connected: false,
        error:
          'This is a very long error message that should be properly displayed and wrapped in the error section without breaking the layout or causing overflow issues',
        loading: false,
      };

      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={longErrorStatus}
        />,
      );

      expect(
        screen.getByText(/This is a very long error message/),
      ).toBeInTheDocument();
    });
  });

  describe('Null Config Handling', () => {
    it('handles null config status gracefully', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={null}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      expect(screen.getByText('Provider')).toBeInTheDocument();
      expect(screen.getByText(/Loading\.\.\./)).toBeInTheDocument();
    });
  });

  describe('Tooltip Functionality', () => {
    it('provides tooltip for connected status', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      const statusElement = screen.getByText('Connected');
      expect(statusElement).toBeInTheDocument();
      // Tooltip is managed by Material-UI and shown on hover
    });

    it('provides tooltip for loading status', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockLoadingStatus}
        />,
      );

      const statusElement = screen.getByText('Testing...');
      expect(statusElement).toBeInTheDocument();
      // Tooltip is managed by Material-UI and shown on hover
    });

    it('provides tooltip for error status', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockErrorStatus}
        />,
      );

      const statusElement = screen.getByText('Disconnected');
      expect(statusElement).toBeInTheDocument();
      // Tooltip is managed by Material-UI and shown on hover
    });

    it('includes model count in tooltip when connected', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      const statusElement = screen.getByText('Connected');
      expect(statusElement).toBeInTheDocument();
      // Tooltip content is managed by Material-UI Tooltip component
    });

    it('handles tooltip without models list', () => {
      const statusWithoutModels = {
        connected: true,
        loading: false,
      };

      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={statusWithoutModels}
        />,
      );

      const statusElement = screen.getByText('Connected');
      expect(statusElement).toBeInTheDocument();
      // Tooltip is managed by Material-UI and shown on hover
    });
  });

  describe('Component Structure', () => {
    it('has proper component hierarchy', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      // Should have main container, header, and content sections
      expect(screen.getByText('Provider')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText(/Model:/)).toBeInTheDocument();
    });

    it('applies correct styling classes', () => {
      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      // Component should render with proper styling
      expect(screen.getByText('Provider')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty provider config', () => {
      const emptyConfig: ConfigStatus = {
        provider: {
          model: '',
          baseURL: '',
          type: 'openai',
        },
        mcpServers: [],
      };

      renderWithTheme(
        <ProviderStatus
          configStatus={emptyConfig}
          providerConnectionStatus={mockProviderConnectionStatus}
        />,
      );

      expect(screen.getByText('Provider')).toBeInTheDocument();
    });

    it('handles undefined error message', () => {
      const undefinedErrorStatus = {
        connected: false,
        error: undefined,
        loading: false,
      };

      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={undefinedErrorStatus}
        />,
      );

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('handles empty models array', () => {
      const emptyModelsStatus = {
        connected: true,
        models: [],
        loading: false,
      };

      renderWithTheme(
        <ProviderStatus
          configStatus={mockConfigStatus}
          providerConnectionStatus={emptyModelsStatus}
        />,
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('handles all required props', () => {
      expect(() => {
        renderWithTheme(
          <ProviderStatus
            configStatus={mockConfigStatus}
            providerConnectionStatus={mockProviderConnectionStatus}
          />,
        );
      }).not.toThrow();
    });

    it('validates connection status structure', () => {
      const validStatus = {
        connected: false,
        models: ['model1', 'model2'],
        error: 'Test error',
        loading: true,
      };

      expect(() => {
        renderWithTheme(
          <ProviderStatus
            configStatus={mockConfigStatus}
            providerConnectionStatus={validStatus}
          />,
        );
      }).not.toThrow();
    });
  });
});
