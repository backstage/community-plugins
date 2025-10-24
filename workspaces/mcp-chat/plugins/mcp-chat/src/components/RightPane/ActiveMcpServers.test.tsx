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
import { ActiveMcpServers } from './ActiveMcpServers';
import { MCPServer, MCPServerType } from '../../types';

const renderWithTheme = (component: ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockServers: MCPServer[] = [
  {
    id: '1',
    name: 'test-server-1',
    enabled: true,
    type: MCPServerType.STDIO,
    status: { valid: true, connected: true },
  },
  {
    id: '2',
    name: 'test-server-2',
    enabled: false,
    type: MCPServerType.SSE,
    status: { valid: true, connected: false },
  },
  {
    id: '3',
    name: 'invalid-server',
    enabled: true,
    type: MCPServerType.STDIO,
    status: { valid: false, connected: false, error: 'Configuration error' },
  },
];

describe('ActiveMcpServers', () => {
  const defaultProps = {
    mcpServers: mockServers,
    onServerToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all provided servers', () => {
      renderWithTheme(<ActiveMcpServers {...defaultProps} />);

      expect(screen.getByText('test-server-1')).toBeInTheDocument();
      expect(screen.getByText('test-server-2')).toBeInTheDocument();
      expect(screen.getByText('invalid-server')).toBeInTheDocument();
    });

    it('displays component header', () => {
      renderWithTheme(<ActiveMcpServers {...defaultProps} />);

      expect(screen.getByText('Active MCP Servers')).toBeInTheDocument();
    });

    it('shows empty state when no servers', () => {
      renderWithTheme(
        <ActiveMcpServers mcpServers={[]} onServerToggle={jest.fn()} />,
      );

      expect(screen.getByText('No MCP servers configured')).toBeInTheDocument();
    });

    it('renders server chips with proper styling', () => {
      renderWithTheme(<ActiveMcpServers {...defaultProps} />);

      const serverChips = screen.getAllByRole('button');
      expect(serverChips).toHaveLength(1);
    });
  });

  describe('server status indicators', () => {
    it('shows connection status through tooltips', () => {
      renderWithTheme(<ActiveMcpServers {...defaultProps} />);

      expect(
        screen.getByLabelText('Click to disable test-server-1 server'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Not connected: Unknown error'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Not connected: Configuration error'),
      ).toBeInTheDocument();
    });

    it('displays proper status indicators', () => {
      renderWithTheme(<ActiveMcpServers {...defaultProps} />);

      const statusIcons = screen.getAllByTestId('FiberManualRecordIcon');
      expect(statusIcons).toHaveLength(3);
    });
  });

  describe('server toggling', () => {
    it('calls onServerToggle when connected server is clicked', () => {
      const onServerToggle = jest.fn();
      renderWithTheme(
        <ActiveMcpServers {...defaultProps} onServerToggle={onServerToggle} />,
      );

      const connectedServer = screen.getByLabelText(
        'Click to disable test-server-1 server',
      );
      fireEvent.click(connectedServer);

      expect(onServerToggle).toHaveBeenCalledWith('1');
    });

    it('does not call onServerToggle for disconnected servers', () => {
      const onServerToggle = jest.fn();
      renderWithTheme(
        <ActiveMcpServers {...defaultProps} onServerToggle={onServerToggle} />,
      );

      const disconnectedServer = screen.getByLabelText(
        'Not connected: Unknown error',
      );
      fireEvent.click(disconnectedServer);

      expect(onServerToggle).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('provides proper aria labels for server chips', () => {
      renderWithTheme(<ActiveMcpServers {...defaultProps} />);

      expect(
        screen.getByLabelText('Click to disable test-server-1 server'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Not connected: Unknown error'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Not connected: Configuration error'),
      ).toBeInTheDocument();
    });

    it('maintains keyboard navigation for clickable servers', () => {
      renderWithTheme(<ActiveMcpServers {...defaultProps} />);

      const clickableServers = screen.getAllByRole('button');
      clickableServers.forEach(server => {
        expect(server).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('error handling', () => {
    it('handles servers with missing status gracefully', () => {
      const serversWithoutStatus = [
        { id: '1', name: 'server1', enabled: true, type: MCPServerType.STDIO },
      ] as any;

      expect(() =>
        renderWithTheme(
          <ActiveMcpServers
            mcpServers={serversWithoutStatus}
            onServerToggle={jest.fn()}
          />,
        ),
      ).not.toThrow();
    });

    it('handles missing onServerToggle gracefully', () => {
      expect(() =>
        renderWithTheme(
          <ActiveMcpServers
            mcpServers={mockServers}
            onServerToggle={undefined as any}
          />,
        ),
      ).not.toThrow();
    });

    it('handles servers with complete data', () => {
      renderWithTheme(
        <ActiveMcpServers
          mcpServers={mockServers}
          onServerToggle={jest.fn()}
        />,
      );

      expect(screen.getByText('test-server-1')).toBeInTheDocument();
      expect(screen.getByText('test-server-2')).toBeInTheDocument();
      expect(screen.getByText('invalid-server')).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('maintains layout with many servers', () => {
      const manyServers = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `server-${i + 1}`,
        enabled: i % 2 === 0,
        type: MCPServerType.STDIO,
        status: { valid: true, connected: i % 3 === 0 },
      }));

      renderWithTheme(
        <ActiveMcpServers
          mcpServers={manyServers}
          onServerToggle={jest.fn()}
        />,
      );

      expect(screen.getByText('Active MCP Servers')).toBeInTheDocument();
      expect(screen.getByText('server-1')).toBeInTheDocument();
      expect(screen.getByText('server-10')).toBeInTheDocument();
    });

    it('handles long server names appropriately', () => {
      const longNameServers = [
        {
          id: '1',
          name: 'very-long-server-name-that-might-cause-layout-issues',
          enabled: true,
          type: MCPServerType.STDIO,
          status: { valid: true, connected: true },
        },
      ];

      renderWithTheme(
        <ActiveMcpServers
          mcpServers={longNameServers}
          onServerToggle={jest.fn()}
        />,
      );

      expect(
        screen.getByText(
          'very-long-server-name-that-might-cause-layout-issues',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('theme integration', () => {
    it('renders with light theme', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });
      render(
        <ThemeProvider theme={lightTheme}>
          <ActiveMcpServers {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Active MCP Servers')).toBeInTheDocument();
    });

    it('renders with dark theme', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });
      render(
        <ThemeProvider theme={darkTheme}>
          <ActiveMcpServers {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Active MCP Servers')).toBeInTheDocument();
    });
  });
});
