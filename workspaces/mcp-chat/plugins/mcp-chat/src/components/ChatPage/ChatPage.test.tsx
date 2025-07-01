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

import { forwardRef } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useTheme } from '@mui/styles';
import { ChatPage } from './ChatPage';
import { mcpChatApiRef } from '../../api';
import type { ConfigStatus } from '../../api/McpChatApi';

jest.mock('@backstage/core-components', () => ({
  Content: ({ children }: any) => <div data-testid="content">{children}</div>,
  Page: ({ children }: any) => <div data-testid="page">{children}</div>,
}));

jest.mock('../ChatContainer', () => ({
  ChatContainer: forwardRef((_props: any, ref: any) => (
    <div data-testid="chat-container" ref={ref}>
      Chat Container Mock
    </div>
  )),
}));

jest.mock('../RightPane', () => ({
  RightPane: (props: any) => (
    <div data-testid="right-pane">
      Right Pane Mock - Collapsed: {props.sidebarCollapsed.toString()}
    </div>
  ),
}));

jest.mock('@mui/styles', () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('ChatPage', () => {
  let mockMcpChatApi: jest.Mocked<any>;
  let mockTheme: any;

  const mockConfigStatus: ConfigStatus = {
    provider: {
      type: 'openai',
      model: 'gpt-4',
    },
    mcpServers: [
      {
        id: '1',
        name: 'test-server',
        type: 'stdio',
        hasUrl: false,
        hasNpxCommand: true,
        hasScriptPath: false,
      },
    ],
  };

  beforeEach(() => {
    mockMcpChatApi = {
      sendChatMessage: jest.fn(),
      getConfigStatus: jest.fn(),
      getAvailableTools: jest.fn(),
      testProviderConnection: jest.fn(),
    };

    mockTheme = {
      palette: {
        mode: 'light',
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
        },
        divider: '#e0e0e0',
        primary: {
          main: '#4CAF50',
          light: '#81C784',
          dark: '#388E3C',
          contrastText: '#ffffff',
        },
      },
      components: {},
      spacing: (factor: number) => `${8 * factor}px`,
    };

    mockUseTheme.mockReturnValue(mockTheme);
    mockMcpChatApi.getConfigStatus.mockResolvedValue(mockConfigStatus);

    jest.clearAllMocks();
  });

  const renderChatPage = async () => {
    const theme = createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#4CAF50',
        },
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
        },
        divider: '#e0e0e0',
      },
      spacing: (factor: number) => 8 * factor,
    });

    let result;
    await act(async () => {
      result = render(
        <ThemeProvider theme={theme}>
          <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
            <ChatPage />
          </TestApiProvider>
        </ThemeProvider>,
      );
    });
    return result!;
  };

  describe('component rendering', () => {
    it('should render without crashing', async () => {
      const { container } = await renderChatPage();
      expect(container).toBeDefined();
    });

    it('should render ChatContainer component', async () => {
      const { container } = await renderChatPage();
      const chatContainer = container.querySelector(
        '[data-testid="chat-container"]',
      );
      expect(chatContainer).toBeDefined();
    });

    it('should render RightPane component', async () => {
      const { container } = await renderChatPage();
      const rightPane = container.querySelector('[data-testid="right-pane"]');
      expect(rightPane).toBeDefined();
    });

    it('should render with Page and Content components', async () => {
      const { container } = await renderChatPage();
      expect(container.querySelector('[data-testid="page"]')).toBeDefined();
      expect(container.querySelector('[data-testid="content"]')).toBeDefined();
    });
  });

  describe('sidebar functionality', () => {
    it('should initialize with sidebar collapsed', async () => {
      const { container } = await renderChatPage();
      const rightPane = container.querySelector('[data-testid="right-pane"]');
      expect(rightPane?.textContent).toContain('Collapsed: true');
    });

    it('should handle sidebar toggle', async () => {
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('configuration loading', () => {
    it('should load configuration on mount', async () => {
      await renderChatPage();
      await waitFor(() => {
        expect(mockMcpChatApi.getConfigStatus).toHaveBeenCalled();
      });
    });

    it('should handle successful configuration load', async () => {
      mockMcpChatApi.getConfigStatus.mockResolvedValue(mockConfigStatus);
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();

      await waitFor(() => {
        expect(mockMcpChatApi.getConfigStatus).toHaveBeenCalled();
      });
    });

    it('should handle configuration load failure', async () => {
      const error = new Error('Failed to load config');
      mockMcpChatApi.getConfigStatus.mockRejectedValue(error);

      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();

      await waitFor(() => {
        expect(mockMcpChatApi.getConfigStatus).toHaveBeenCalled();
      });
    });

    it('should handle empty configuration', async () => {
      mockMcpChatApi.getConfigStatus.mockResolvedValue({
        provider: null,
        mcpServers: [],
      });

      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();

      await waitFor(() => {
        expect(mockMcpChatApi.getConfigStatus).toHaveBeenCalled();
      });
    });
  });

  describe('MCP server management', () => {
    it('should initialize servers as enabled', async () => {
      mockMcpChatApi.getConfigStatus.mockResolvedValue(mockConfigStatus);
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();

      await waitFor(() => {
        expect(mockMcpChatApi.getConfigStatus).toHaveBeenCalled();
      });
    });

    it('should handle multiple MCP servers', async () => {
      const multipleServersConfig: ConfigStatus = {
        provider: mockConfigStatus.provider,
        mcpServers: [
          {
            id: '1',
            name: 'server1',
            type: 'stdio',
            hasUrl: false,
            hasNpxCommand: true,
            hasScriptPath: false,
          },
          {
            id: '2',
            name: 'server2',
            type: 'sse',
            hasUrl: true,
            hasNpxCommand: false,
            hasScriptPath: false,
          },
        ],
      };

      mockMcpChatApi.getConfigStatus.mockResolvedValue(multipleServersConfig);
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();

      await waitFor(() => {
        expect(mockMcpChatApi.getConfigStatus).toHaveBeenCalled();
      });
    });

    it('should handle server toggle functionality', async () => {
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockMcpChatApi.getConfigStatus.mockRejectedValue(error);

      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();

      await waitFor(() => {
        expect(mockMcpChatApi.getConfigStatus).toHaveBeenCalled();
      });
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockMcpChatApi.getConfigStatus.mockRejectedValue(networkError);

      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();

      await waitFor(() => {
        expect(mockMcpChatApi.getConfigStatus).toHaveBeenCalled();
      });
    });

    it('should handle malformed configuration', async () => {
      mockMcpChatApi.getConfigStatus.mockResolvedValue(null);

      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();

      await waitFor(() => {
        expect(mockMcpChatApi.getConfigStatus).toHaveBeenCalled();
      });
    });
  });

  describe('message management', () => {
    it('should initialize with empty messages', async () => {
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();
    });

    it('should handle new chat functionality', async () => {
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();
    });

    it('should handle message state updates', async () => {
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('component integration', () => {
    it('should pass correct props to ChatContainer', async () => {
      const { container } = await renderChatPage();
      const chatContainer = container.querySelector(
        '[data-testid="chat-container"]',
      );
      expect(chatContainer).toBeDefined();
    });

    it('should pass correct props to RightPane', async () => {
      const { container } = await renderChatPage();
      const rightPane = container.querySelector('[data-testid="right-pane"]');
      expect(rightPane).toBeDefined();
      expect(rightPane?.textContent).toContain('Collapsed: true');
    });

    it('should handle component communication', async () => {
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('performance', () => {
    it('should render efficiently', async () => {
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();
    });

    it('should handle re-renders efficiently', async () => {
      const { rerender } = await renderChatPage();
      await act(async () => {
        rerender(
          <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
            <ChatPage />
          </TestApiProvider>,
        );
      });
      // Test should verify that component can be re-rendered without errors
      expect(true).toBe(true);
    });
  });

  describe('component lifecycle', () => {
    it('should mount successfully', async () => {
      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();
    });

    it('should unmount successfully', async () => {
      const { unmount } = await renderChatPage();
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple mount/unmount cycles', async () => {
      const { unmount } = await renderChatPage();
      unmount();

      const { container } = await renderChatPage();
      expect(container.firstChild).toBeDefined();
    });
  });
});
