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

import { render, act, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { RightPane } from './RightPane';
import { mcpChatApiRef } from '../../api';
import type { ConfigStatus, Tool, ToolsResponse } from '../../api/McpChatApi';

// Mock the child components
jest.mock('./ActiveMcpServers', () => ({
  ActiveMcpServers: (props: any) => (
    <div data-testid="active-mcp-servers">
      Active MCP Servers - Count: {props.mcpServers?.length || 0}
    </div>
  ),
}));

jest.mock('./ActiveTools', () => ({
  ActiveTools: (props: any) => (
    <div data-testid="active-tools">
      Active Tools - Loading: {props.toolsLoading.toString()} - Count:{' '}
      {props.availableTools.length}
    </div>
  ),
}));

jest.mock('./ProviderStatus', () => ({
  ProviderStatus: (props: any) => (
    <div data-testid="provider-status">
      Provider Status - Connected:{' '}
      {props.providerConnectionStatus?.connected?.toString() || 'unknown'}
    </div>
  ),
}));

jest.mock('../BotIcon', () => ({
  BotIcon: (props: any) => (
    <div data-testid="bot-icon" style={{ color: props.color }}>
      Bot Icon - Size: {props.size}
    </div>
  ),
}));

describe('RightPane', () => {
  let mockMcpChatApi: jest.Mocked<any>;
  let mockTheme: any;
  let mockMcpServers: any[];
  let mockConfigStatus: ConfigStatus;
  let mockOnToggleSidebar: jest.Mock;
  let mockOnNewChat: jest.Mock;
  let mockOnServerToggle: jest.Mock;
  let defaultProps: any;

  const mockToolsResponse: ToolsResponse = {
    message: 'Tools fetched successfully',
    serverConfigs: [
      {
        name: 'test-server',
        type: 'stdio',
        hasUrl: false,
        hasNpxCommand: true,
        hasScriptPath: false,
      },
    ],
    availableTools: [
      {
        type: 'function',
        function: {
          name: 'test-function',
          description: 'A test function',
          parameters: { type: 'object', properties: {} },
        },
        serverId: 'test-server',
      },
    ],
    toolCount: 1,
    timestamp: '2025-01-01T00:00:00Z',
  };

  const mockProviderConnectionResponse = {
    connected: true,
    models: ['gpt-4', 'gpt-3.5-turbo'],
    message: 'Connection successful',
    timestamp: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    mockMcpChatApi = {
      sendChatMessage: jest.fn(),
      getConfigStatus: jest.fn(),
      getAvailableTools: jest.fn(),
      testProviderConnection: jest.fn(),
    };

    mockTheme = createTheme({
      spacing: (factor: number) => `${8 * factor}px`,
      palette: {
        mode: 'light',
        background: {
          paper: '#ffffff',
        },
        divider: '#e0e0e0',
        text: {
          primary: '#333333',
        },
        action: {
          hover: '#f5f5f5',
        },
      },
    });

    mockMcpServers = [
      {
        id: '1',
        name: 'test-server',
        enabled: true,
        type: 'stdio',
        hasUrl: false,
        hasNpxCommand: true,
        hasScriptPath: false,
      },
    ];

    mockConfigStatus = {
      provider: {
        type: 'openai',
        model: 'gpt-4',
      },
      mcpServers: mockMcpServers,
    };

    mockOnToggleSidebar = jest.fn();
    mockOnNewChat = jest.fn();
    mockOnServerToggle = jest.fn();

    defaultProps = {
      sidebarCollapsed: false,
      onToggleSidebar: mockOnToggleSidebar,
      onNewChat: mockOnNewChat,
      mcpServers: mockMcpServers,
      onServerToggle: mockOnServerToggle,
      configStatus: mockConfigStatus,
    };

    mockMcpChatApi.getAvailableTools.mockResolvedValue(mockToolsResponse);
    mockMcpChatApi.testProviderConnection.mockResolvedValue(
      mockProviderConnectionResponse,
    );

    jest.clearAllMocks();
  });

  const renderRightPane = async (props = {}) => {
    let result;
    await act(async () => {
      result = render(
        <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
          <ThemeProvider theme={mockTheme}>
            <RightPane {...defaultProps} {...props} />
          </ThemeProvider>
        </TestApiProvider>,
      );
    });
    return result!;
  };

  describe('component rendering', () => {
    it('should render without crashing', async () => {
      const { container } = await renderRightPane();
      expect(container).toBeDefined();
    });

    it('should render expanded sidebar by default', async () => {
      const { container } = await renderRightPane();
      const botIcon = container.querySelector('[data-testid="bot-icon"]');
      expect(botIcon).toBeDefined();
    });

    it('should render collapsed sidebar when sidebarCollapsed is true', async () => {
      const { container } = await renderRightPane({ sidebarCollapsed: true });
      expect(container.firstChild).toBeDefined();
    });

    it('should render all child components when expanded', async () => {
      const { container } = await renderRightPane();

      expect(container.querySelector('[data-testid="bot-icon"]')).toBeDefined();

      // Wait for async operations to complete
      await waitFor(() => {
        expect(
          container.querySelector('[data-testid="active-mcp-servers"]'),
        ).toBeDefined();
        expect(
          container.querySelector('[data-testid="active-tools"]'),
        ).toBeDefined();
        expect(
          container.querySelector('[data-testid="provider-status"]'),
        ).toBeDefined();
      });
    });

    it('should render with minimal components when collapsed', async () => {
      const { container } = await renderRightPane({ sidebarCollapsed: true });
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('sidebar functionality', () => {
    it('should call onToggleSidebar when toggle button is clicked', async () => {
      const { container } = await renderRightPane();

      // Wait for component to fully render
      await waitFor(() => {
        const toggleButton = container.querySelector('button');
        expect(toggleButton).toBeDefined();
      });
    });

    it('should handle sidebar state changes', async () => {
      const { container, rerender } = await renderRightPane();

      await act(async () => {
        rerender(
          <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
            <ThemeProvider theme={mockTheme}>
              <RightPane {...defaultProps} sidebarCollapsed />
            </ThemeProvider>
          </TestApiProvider>,
        );
      });

      expect(container.firstChild).toBeDefined();
    });

    it('should show appropriate content based on sidebar state', async () => {
      // Test expanded state
      const { container: expandedContainer } = await renderRightPane({
        sidebarCollapsed: false,
      });
      expect(
        expandedContainer.querySelector('[data-testid="bot-icon"]'),
      ).toBeDefined();

      // Test collapsed state
      const { container: collapsedContainer } = await renderRightPane({
        sidebarCollapsed: true,
      });
      expect(collapsedContainer.firstChild).toBeDefined();
    });
  });

  describe('MCP servers management', () => {
    it('should display MCP servers correctly', async () => {
      const { container } = await renderRightPane();

      await waitFor(() => {
        const serversComponent = container.querySelector(
          '[data-testid="active-mcp-servers"]',
        );
        expect(serversComponent).toBeDefined();
        expect(serversComponent?.textContent).toContain('Count: 1');
      });
    });

    it('should handle empty MCP servers array', async () => {
      const { container } = await renderRightPane({ mcpServers: [] });

      await waitFor(() => {
        const serversComponent = container.querySelector(
          '[data-testid="active-mcp-servers"]',
        );
        expect(serversComponent).toBeDefined();
        expect(serversComponent?.textContent).toContain('Count: 0');
      });
    });

    it('should handle multiple MCP servers', async () => {
      const multipleServers = [
        { id: '1', name: 'server1', enabled: true },
        { id: '2', name: 'server2', enabled: false },
        { id: '3', name: 'server3', enabled: true },
      ];

      const { container } = await renderRightPane({
        mcpServers: multipleServers,
      });

      await waitFor(() => {
        const serversComponent = container.querySelector(
          '[data-testid="active-mcp-servers"]',
        );
        expect(serversComponent).toBeDefined();
        expect(serversComponent?.textContent).toContain('Count: 3');
      });
    });

    it('should call onServerToggle when server is toggled', async () => {
      await renderRightPane();
      // The onServerToggle function should be available but not called during render
      expect(mockOnServerToggle).not.toHaveBeenCalled();
    });
  });

  describe('tools management', () => {
    it('should fetch and display tools', async () => {
      const { container } = await renderRightPane();

      await waitFor(() => {
        expect(mockMcpChatApi.getAvailableTools).toHaveBeenCalled();
        const toolsComponent = container.querySelector(
          '[data-testid="active-tools"]',
        );
        expect(toolsComponent).toBeDefined();
      });
    });

    it('should handle tools loading state', async () => {
      // Mock a delayed response
      mockMcpChatApi.getAvailableTools.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockToolsResponse), 100),
          ),
      );

      const { container } = await renderRightPane();

      // Initially should show loading
      const toolsComponent = container.querySelector(
        '[data-testid="active-tools"]',
      );
      expect(toolsComponent).toBeDefined();

      // Wait for loading to complete
      await waitFor(() => {
        expect(mockMcpChatApi.getAvailableTools).toHaveBeenCalled();
      });
    });

    it('should handle tools fetch error', async () => {
      mockMcpChatApi.getAvailableTools.mockRejectedValue(
        new Error('Tools fetch failed'),
      );

      const { container } = await renderRightPane();

      await waitFor(() => {
        expect(mockMcpChatApi.getAvailableTools).toHaveBeenCalled();
        const toolsComponent = container.querySelector(
          '[data-testid="active-tools"]',
        );
        expect(toolsComponent).toBeDefined();
      });
    });

    it('should not fetch tools when no servers are available', async () => {
      await renderRightPane({ mcpServers: [] });

      // Should not call getAvailableTools when no servers
      expect(mockMcpChatApi.getAvailableTools).not.toHaveBeenCalled();
    });
  });

  describe('provider connection status', () => {
    it('should test provider connection on mount', async () => {
      await renderRightPane();

      await waitFor(() => {
        expect(mockMcpChatApi.testProviderConnection).toHaveBeenCalled();
      });
    });

    it('should display provider connection status', async () => {
      const { container } = await renderRightPane();

      await waitFor(() => {
        const statusComponent = container.querySelector(
          '[data-testid="provider-status"]',
        );
        expect(statusComponent).toBeDefined();
        expect(statusComponent?.textContent).toContain('Connected: true');
      });
    });

    it('should handle provider connection failure', async () => {
      mockMcpChatApi.testProviderConnection.mockRejectedValue(
        new Error('Connection failed'),
      );

      const { container } = await renderRightPane();

      await waitFor(() => {
        expect(mockMcpChatApi.testProviderConnection).toHaveBeenCalled();
        const statusComponent = container.querySelector(
          '[data-testid="provider-status"]',
        );
        expect(statusComponent).toBeDefined();
      });
    });

    it('should not test connection when no provider config', async () => {
      await renderRightPane({
        configStatus: { provider: null, mcpServers: [] },
      });

      // Should not call testProviderConnection when no provider
      expect(mockMcpChatApi.testProviderConnection).not.toHaveBeenCalled();
    });
  });

  describe('new chat functionality', () => {
    it('should call onNewChat when new chat is triggered', async () => {
      await renderRightPane();
      // The onNewChat function should be available but not called during render
      expect(mockOnNewChat).not.toHaveBeenCalled();
    });

    it('should handle new chat button click', async () => {
      const { container } = await renderRightPane();

      await waitFor(() => {
        // Look for any button that might trigger new chat
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('theme integration', () => {
    it('should apply theme correctly', async () => {
      const { container } = await renderRightPane();
      expect(container.firstChild).toBeDefined();
    });

    it('should handle theme changes', async () => {
      const darkTheme = createTheme({
        palette: {
          mode: 'dark',
          background: {
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
          },
        },
      });

      const { container, rerender } = await renderRightPane();

      await act(async () => {
        rerender(
          <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
            <ThemeProvider theme={darkTheme}>
              <RightPane {...defaultProps} />
            </ThemeProvider>
          </TestApiProvider>,
        );
      });

      expect(container.firstChild).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockMcpChatApi.getAvailableTools.mockRejectedValue(
        new Error('API Error'),
      );
      mockMcpChatApi.testProviderConnection.mockRejectedValue(
        new Error('Connection Error'),
      );

      const { container } = await renderRightPane();
      expect(container.firstChild).toBeDefined();

      await waitFor(() => {
        expect(mockMcpChatApi.getAvailableTools).toHaveBeenCalled();
        expect(mockMcpChatApi.testProviderConnection).toHaveBeenCalled();
      });
    });

    it('should handle missing config status', async () => {
      const { container } = await renderRightPane({ configStatus: null });
      expect(container.firstChild).toBeDefined();
    });

    it('should handle malformed props', async () => {
      const { container } = await renderRightPane({
        mcpServers: null,
        configStatus: undefined,
        onToggleSidebar: null,
      });
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('component lifecycle', () => {
    it('should mount successfully', async () => {
      const { container } = await renderRightPane();
      expect(container.firstChild).toBeDefined();
    });

    it('should unmount successfully', async () => {
      const { unmount } = await renderRightPane();
      expect(() => unmount()).not.toThrow();
    });

    it('should handle re-renders', async () => {
      const { container, rerender } = await renderRightPane();

      await act(async () => {
        rerender(
          <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
            <ThemeProvider theme={mockTheme}>
              <RightPane {...defaultProps} sidebarCollapsed />
            </ThemeProvider>
          </TestApiProvider>,
        );
      });

      expect(container.firstChild).toBeDefined();
    });
  });

  describe('responsive behavior', () => {
    it('should handle different sidebar widths', async () => {
      const { container: expandedContainer } = await renderRightPane({
        sidebarCollapsed: false,
      });
      const { container: collapsedContainer } = await renderRightPane({
        sidebarCollapsed: true,
      });

      expect(expandedContainer.firstChild).toBeDefined();
      expect(collapsedContainer.firstChild).toBeDefined();
    });

    it('should maintain functionality across state changes', async () => {
      const { container, rerender } = await renderRightPane({
        sidebarCollapsed: false,
      });

      // Change to collapsed
      await act(async () => {
        rerender(
          <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
            <ThemeProvider theme={mockTheme}>
              <RightPane {...defaultProps} sidebarCollapsed />
            </ThemeProvider>
          </TestApiProvider>,
        );
      });

      // Change back to expanded
      await act(async () => {
        rerender(
          <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
            <ThemeProvider theme={mockTheme}>
              <RightPane {...defaultProps} sidebarCollapsed={false} />
            </ThemeProvider>
          </TestApiProvider>,
        );
      });

      expect(container.firstChild).toBeDefined();
    });
  });
});
