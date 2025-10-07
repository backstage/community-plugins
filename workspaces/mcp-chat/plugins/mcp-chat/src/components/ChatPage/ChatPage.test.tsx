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

import { ReactNode, forwardRef, useImperativeHandle } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ChatPage } from './ChatPage';
import { mcpChatApiRef } from '../../api';
import { MCPServerType } from '../../types';

const mockChatContainer = jest.fn();
const mockRightPane = jest.fn();
const mockCancelOngoingRequest = jest.fn();

jest.mock('@backstage/core-components', () => ({
  Content: ({ children }: { children: ReactNode }) => (
    <div data-testid="content">{children}</div>
  ),
  Page: ({ children }: { children: ReactNode }) => (
    <div data-testid="page">{children}</div>
  ),
  ResponseErrorPanel: ({ error }: { error: Error }) => (
    <div data-testid="error-panel">{error.message}</div>
  ),
}));

jest.mock('../ChatContainer', () => ({
  ChatContainer: forwardRef((props: any, ref: any) => {
    mockChatContainer(props);

    // Expose the cancelOngoingRequest method through the ref
    useImperativeHandle(ref, () => ({
      cancelOngoingRequest: mockCancelOngoingRequest,
    }));

    return <div data-testid="chat-container" />;
  }),
}));

jest.mock('../RightPane', () => ({
  RightPane: (props: any) => {
    mockRightPane(props);
    return (
      <div data-testid="right-pane">
        <button onClick={props.onToggleSidebar}>Toggle Sidebar</button>
        <button onClick={props.onNewChat}>New Chat</button>
      </div>
    );
  },
}));

// Default mock for hooks
const mockUseMcpServers = jest.fn(() => ({
  mcpServers: [
    { id: '1', name: 'test-server', enabled: true, type: MCPServerType.STDIO },
  ],
  error: null,
  handleServerToggle: jest.fn(),
}));

const mockUseProviderStatus = jest.fn(() => ({
  providerStatusData: { connected: true },
  isLoading: false,
  error: null,
}));

jest.mock('../../hooks', () => ({
  useProviderStatus: () => mockUseProviderStatus(),
  useMcpServers: () => mockUseMcpServers(),
}));

const mockMcpChatApi = {
  sendChatMessage: jest.fn(),
  getConfigStatus: jest.fn(),
  getAvailableTools: jest.fn(),
  testProviderConnection: jest.fn(),
};

const renderChatPage = () => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
        <ChatPage />
      </TestApiProvider>
    </ThemeProvider>,
  );
};

describe('ChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChatContainer.mockClear();
    mockRightPane.mockClear();
    mockCancelOngoingRequest.mockClear();

    // Reset mocks to default values
    mockUseMcpServers.mockReturnValue({
      mcpServers: [
        {
          id: '1',
          name: 'test-server',
          enabled: true,
          type: MCPServerType.STDIO,
        },
      ],
      error: null,
      handleServerToggle: jest.fn(),
    });

    mockUseProviderStatus.mockReturnValue({
      providerStatusData: { connected: true },
      isLoading: false,
      error: null,
    });
  });

  describe('rendering', () => {
    it('renders the main page structure', () => {
      renderChatPage();

      expect(screen.getByTestId('page')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByTestId('chat-container')).toBeInTheDocument();
      expect(screen.getByTestId('right-pane')).toBeInTheDocument();
    });

    it('passes correct props to ChatContainer', () => {
      renderChatPage();

      expect(mockChatContainer).toHaveBeenCalledWith(
        expect.objectContaining({
          sidebarCollapsed: true,
          mcpServers: expect.arrayContaining([
            expect.objectContaining({ name: 'test-server' }),
          ]),
          messages: [],
          onMessagesChange: expect.any(Function),
        }),
      );
    });

    it('passes correct props to RightPane', () => {
      renderChatPage();

      expect(mockRightPane).toHaveBeenCalledWith(
        expect.objectContaining({
          sidebarCollapsed: true,
          onToggleSidebar: expect.any(Function),
          onNewChat: expect.any(Function),
          mcpServers: expect.arrayContaining([
            expect.objectContaining({ name: 'test-server' }),
          ]),
          onServerToggle: expect.any(Function),
          providerStatus: expect.objectContaining({
            providerStatusData: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('sidebar functionality', () => {
    it('initializes with sidebar collapsed', () => {
      renderChatPage();

      expect(mockRightPane).toHaveBeenCalledWith(
        expect.objectContaining({ sidebarCollapsed: true }),
      );
    });

    it('toggles sidebar state when toggle button is clicked', () => {
      renderChatPage();

      const toggleButton = screen.getByText('Toggle Sidebar');
      fireEvent.click(toggleButton);

      expect(mockRightPane).toHaveBeenLastCalledWith(
        expect.objectContaining({ sidebarCollapsed: false }),
      );
    });
  });

  describe('new chat functionality', () => {
    it('clears messages when new chat is triggered', () => {
      renderChatPage();

      const newChatButton = screen.getByText('New Chat');
      fireEvent.click(newChatButton);

      expect(mockChatContainer).toHaveBeenLastCalledWith(
        expect.objectContaining({ messages: [] }),
      );
    });

    it('calls cancelOngoingRequest when new chat is triggered', () => {
      renderChatPage();

      const newChatButton = screen.getByText('New Chat');
      fireEvent.click(newChatButton);

      expect(mockCancelOngoingRequest).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('displays error panel when there is an MCP servers error', () => {
      // Mock the hook to return an error
      mockUseMcpServers.mockReturnValue({
        mcpServers: [],
        error: 'Failed to load servers' as any,
        handleServerToggle: jest.fn(),
      });

      renderChatPage();

      expect(screen.getByTestId('error-panel')).toBeInTheDocument();
      expect(screen.getByText('Failed to load servers')).toBeInTheDocument();
    });

    it('hides chat components when error is present', () => {
      // Mock the hook to return an error
      mockUseMcpServers.mockReturnValue({
        mcpServers: [],
        error: 'Server error' as any,
        handleServerToggle: jest.fn(),
      });

      renderChatPage();

      expect(screen.queryByTestId('chat-container')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-pane')).not.toBeInTheDocument();
    });
  });

  describe('ref forwarding', () => {
    it('exposes cancel function through ChatContainer ref', () => {
      renderChatPage();

      // Verify that the ref was set up correctly by triggering new chat
      const newChatButton = screen.getByText('New Chat');
      fireEvent.click(newChatButton);

      // The cancelOngoingRequest should have been called
      expect(mockCancelOngoingRequest).toHaveBeenCalled();
    });
  });
});
