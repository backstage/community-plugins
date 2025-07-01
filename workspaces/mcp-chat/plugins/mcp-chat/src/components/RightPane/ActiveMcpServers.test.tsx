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
import { ActiveMcpServers } from './ActiveMcpServers';

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

interface MCPServer {
  id?: string;
  name: string;
  enabled: boolean;
  type?: string;
  hasUrl?: boolean;
  hasNpxCommand?: boolean;
  hasScriptPath?: boolean;
}

describe('ActiveMcpServers', () => {
  const mockOnServerToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMcpServers: MCPServer[] = [
    {
      id: 'filesystem',
      name: 'filesystem',
      enabled: true,
      type: 'stdio',
      hasUrl: false,
      hasNpxCommand: false,
      hasScriptPath: true,
    },
    {
      id: 'database',
      name: 'database',
      enabled: true,
      type: 'stdio',
      hasUrl: false,
      hasNpxCommand: true,
      hasScriptPath: false,
    },
    {
      id: 'web-server',
      name: 'web-server',
      enabled: false,
      type: 'sse',
      hasUrl: true,
      hasNpxCommand: false,
      hasScriptPath: false,
    },
    {
      id: 'api-server',
      name: 'api-server',
      enabled: false,
      type: 'stdio',
      hasUrl: false,
      hasNpxCommand: false,
      hasScriptPath: true,
    },
  ];

  describe('Rendering', () => {
    it('renders the component with title and icon', () => {
      renderWithTheme(
        <ActiveMcpServers
          mcpServers={mockMcpServers}
          onServerToggle={mockOnServerToggle}
        />,
      );

      expect(screen.getByText('Active MCP Servers')).toBeInTheDocument();
      expect(screen.getByTestId('MemoryIcon')).toBeInTheDocument();
    });

    it('renders all MCP servers as chips', () => {
      renderWithTheme(
        <ActiveMcpServers
          mcpServers={mockMcpServers}
          onServerToggle={mockOnServerToggle}
        />,
      );

      mockMcpServers.forEach(server => {
        expect(screen.getByText(server.name)).toBeInTheDocument();
      });
    });

    it('displays enabled servers with enabled styling', () => {
      renderWithTheme(
        <ActiveMcpServers
          mcpServers={mockMcpServers}
          onServerToggle={mockOnServerToggle}
        />,
      );

      const enabledServers = mockMcpServers.filter(s => s.enabled);
      enabledServers.forEach(server => {
        const chip = screen.getByText(server.name).closest('.MuiChip-root');
        expect(chip).toHaveStyle({
          backgroundColor: '#e8f5e8',
          color: '#4CAF50',
          border: '2px solid #4CAF50',
        });
      });
    });

    it('displays disabled servers with disabled styling', () => {
      renderWithTheme(
        <ActiveMcpServers
          mcpServers={mockMcpServers}
          onServerToggle={mockOnServerToggle}
        />,
      );

      const disabledServers = mockMcpServers.filter(s => !s.enabled);
      disabledServers.forEach(server => {
        const chip = screen.getByText(server.name).closest('.MuiChip-root');
        expect(chip).toHaveStyle({
          backgroundColor: 'transparent',
          color: '#666666',
          border: '2px solid #ddd',
        });
      });
    });

    it('shows empty state when no servers are provided', () => {
      renderWithTheme(
        <ActiveMcpServers
          mcpServers={[]}
          onServerToggle={mockOnServerToggle}
        />,
      );

      expect(screen.getByText('No MCP servers configured')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onServerToggle when a server chip is clicked', () => {
      renderWithTheme(
        <ActiveMcpServers
          mcpServers={mockMcpServers}
          onServerToggle={mockOnServerToggle}
        />,
      );

      const filesystemChip = screen.getByText('filesystem');
      fireEvent.click(filesystemChip);

      expect(mockOnServerToggle).toHaveBeenCalledWith('filesystem');
      expect(mockOnServerToggle).toHaveBeenCalledTimes(1);
    });

    it('calls onServerToggle with correct server name for multiple clicks', () => {
      renderWithTheme(
        <ActiveMcpServers
          mcpServers={mockMcpServers}
          onServerToggle={mockOnServerToggle}
        />,
      );

      const filesystemChip = screen.getByText('filesystem');
      const databaseChip = screen.getByText('database');

      fireEvent.click(filesystemChip);
      fireEvent.click(databaseChip);

      expect(mockOnServerToggle).toHaveBeenCalledTimes(2);
      expect(mockOnServerToggle).toHaveBeenNthCalledWith(1, 'filesystem');
      expect(mockOnServerToggle).toHaveBeenNthCalledWith(2, 'database');
    });

    it('shows correct tooltip text for enabled servers', async () => {
      renderWithTheme(
        <ActiveMcpServers
          mcpServers={[mockMcpServers[0]]} // enabled server
          onServerToggle={mockOnServerToggle}
        />,
      );

      const chip = screen.getByText('filesystem');
      fireEvent.mouseOver(chip);

      expect(
        await screen.findByText('Click to disable filesystem server'),
      ).toBeInTheDocument();
    });

    it('shows correct tooltip text for disabled servers', async () => {
      renderWithTheme(
        <ActiveMcpServers
          mcpServers={[mockMcpServers[2]]} // disabled server
          onServerToggle={mockOnServerToggle}
        />,
      );

      const chip = screen.getByText('web-server');
      fireEvent.mouseOver(chip);

      expect(
        await screen.findByText('Click to enable web-server server'),
      ).toBeInTheDocument();
    });
  });

  describe('Server Properties', () => {
    it('handles servers with minimal properties', () => {
      const minimalServers: MCPServer[] = [
        {
          name: 'minimal-server',
          enabled: true,
        },
        {
          name: 'another-minimal',
          enabled: false,
        },
      ];

      renderWithTheme(
        <ActiveMcpServers
          mcpServers={minimalServers}
          onServerToggle={mockOnServerToggle}
        />,
      );

      expect(screen.getByText('minimal-server')).toBeInTheDocument();
      expect(screen.getByText('another-minimal')).toBeInTheDocument();
    });

    it('handles servers with all optional properties', () => {
      const fullServers: MCPServer[] = [
        {
          id: 'full-server-1',
          name: 'full-server',
          enabled: true,
          type: 'sse',
          hasUrl: true,
          hasNpxCommand: true,
          hasScriptPath: true,
        },
      ];

      renderWithTheme(
        <ActiveMcpServers
          mcpServers={fullServers}
          onServerToggle={mockOnServerToggle}
        />,
      );

      expect(screen.getByText('full-server')).toBeInTheDocument();

      const chip = screen.getByText('full-server');
      fireEvent.click(chip);

      expect(mockOnServerToggle).toHaveBeenCalledWith('full-server');
    });
  });

  describe('Edge Cases', () => {
    it('handles servers with empty names gracefully', () => {
      const serversWithEmptyNames: MCPServer[] = [
        {
          name: '',
          enabled: true,
        },
      ];

      renderWithTheme(
        <ActiveMcpServers
          mcpServers={serversWithEmptyNames}
          onServerToggle={mockOnServerToggle}
        />,
      );

      // The component should still render, even with empty name
      const chips = screen.getAllByRole('button');
      expect(chips).toHaveLength(1);
    });

    it('handles large number of servers', () => {
      const manyServers: MCPServer[] = Array.from({ length: 20 }, (_, i) => ({
        id: `server-${i}`,
        name: `server-${i}`,
        enabled: i % 2 === 0,
        type: 'stdio',
      }));

      renderWithTheme(
        <ActiveMcpServers
          mcpServers={manyServers}
          onServerToggle={mockOnServerToggle}
        />,
      );

      manyServers.forEach(server => {
        expect(screen.getByText(server.name)).toBeInTheDocument();
      });
    });

    it('handles servers with long names', () => {
      const longNameServers: MCPServer[] = [
        {
          name: 'this-is-a-very-long-server-name-that-might-cause-layout-issues',
          enabled: true,
        },
      ];

      renderWithTheme(
        <ActiveMcpServers
          mcpServers={longNameServers}
          onServerToggle={mockOnServerToggle}
        />,
      );

      expect(
        screen.getByText(
          'this-is-a-very-long-server-name-that-might-cause-layout-issues',
        ),
      ).toBeInTheDocument();
    });
  });
});
