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
import { ActiveTools } from './ActiveTools';
import { MCPServer, Tool } from '../../types';

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

const renderWithTheme = (component: ReactElement, theme = mockTheme) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ActiveTools', () => {
  const mockMcpServers: MCPServer[] = [
    {
      id: 'filesystem',
      name: 'filesystem',
      enabled: true,
      type: 'stdio',
      status: { valid: true, connected: true },
    },
    {
      id: 'database',
      name: 'database',
      enabled: true,
      type: 'stdio',
      status: { valid: true, connected: true },
    },
  ];

  const mockTools: Tool[] = [
    {
      type: 'function',
      function: {
        name: 'read_file',
        description: 'Read contents of a file',
        parameters: {},
      },
      serverId: 'filesystem',
    },
    {
      type: 'function',
      function: {
        name: 'write_file',
        description: 'Write contents to a file',
        parameters: {},
      },
      serverId: 'filesystem',
    },
    {
      type: 'function',
      function: {
        name: 'execute_query',
        description: 'Execute SQL query',
        parameters: {},
      },
      serverId: 'database',
    },
  ];

  const defaultProps = {
    mcpServers: mockMcpServers,
    availableTools: mockTools,
    toolsLoading: false,
  };

  describe('rendering', () => {
    it('renders component header', () => {
      renderWithTheme(<ActiveTools {...defaultProps} />);

      expect(screen.getByText('Active Tools')).toBeInTheDocument();
    });

    it('displays available tools', () => {
      renderWithTheme(<ActiveTools {...defaultProps} />);

      expect(screen.getByText('read_file')).toBeInTheDocument();
      expect(screen.getByText('write_file')).toBeInTheDocument();
      expect(screen.getByText('execute_query')).toBeInTheDocument();
    });

    it('shows tool descriptions', () => {
      renderWithTheme(<ActiveTools {...defaultProps} />);

      expect(screen.getByText('Read contents of a file')).toBeInTheDocument();
      expect(screen.getByText('Write contents to a file')).toBeInTheDocument();
      expect(screen.getByText('Execute SQL query')).toBeInTheDocument();
    });

    it('groups tools by server', () => {
      renderWithTheme(<ActiveTools {...defaultProps} />);

      expect(screen.getByText('filesystem')).toBeInTheDocument();
      expect(screen.getByText('database')).toBeInTheDocument();
    });

    it('shows empty state when no tools available', () => {
      renderWithTheme(
        <ActiveTools
          availableTools={[]}
          toolsLoading={false}
          mcpServers={[]}
        />,
      );

      expect(screen.getByText('Active Tools')).toBeInTheDocument();
    });
  });

  describe('loading states', () => {
    it('shows loading indicator when tools are loading', () => {
      renderWithTheme(
        <ActiveTools
          availableTools={[]}
          toolsLoading
          mcpServers={mockMcpServers}
        />,
      );

      expect(screen.getAllByText('...')).toHaveLength(2);
    });

    it('shows tools after loading completes', () => {
      const { rerender } = renderWithTheme(
        <ActiveTools
          availableTools={[]}
          toolsLoading
          mcpServers={mockMcpServers}
        />,
      );

      expect(screen.getAllByText('...')).toHaveLength(2);

      rerender(
        <ThemeProvider theme={mockTheme}>
          <ActiveTools {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.queryByText('...')).not.toBeInTheDocument();
      expect(screen.getByText('read_file')).toBeInTheDocument();
    });
  });

  describe('tool categorization', () => {
    it('handles tools from same server', () => {
      const toolsFromSameServer: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'read_file',
            description: 'Read contents of a file',
            parameters: {},
          },
          serverId: 'filesystem',
        },
        {
          type: 'function',
          function: {
            name: 'write_file',
            description: 'Write contents to a file',
            parameters: {},
          },
          serverId: 'filesystem',
        },
      ];

      renderWithTheme(
        <ActiveTools
          availableTools={toolsFromSameServer}
          toolsLoading={false}
          mcpServers={mockMcpServers}
        />,
      );

      expect(screen.getByText('filesystem')).toBeInTheDocument();
      expect(screen.getByText('read_file')).toBeInTheDocument();
      expect(screen.getByText('write_file')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('handles malformed tool data gracefully', () => {
      const malformedTools = [
        {
          type: 'function',
          function: { name: 'broken_tool' },
          serverId: 'filesystem',
        },
      ] as any;

      expect(() =>
        renderWithTheme(
          <ActiveTools
            availableTools={malformedTools}
            toolsLoading={false}
            mcpServers={mockMcpServers}
          />,
        ),
      ).not.toThrow();
    });

    it('handles tools without matching server', () => {
      const toolsWithoutServer: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'orphan_tool',
            description: 'A tool without server info',
            parameters: {},
          },
          serverId: 'unknown',
        },
      ];

      renderWithTheme(
        <ActiveTools
          availableTools={toolsWithoutServer}
          toolsLoading={false}
          mcpServers={mockMcpServers}
        />,
      );

      expect(
        screen.getAllByText('No tools available for this server'),
      ).toHaveLength(2);
    });
  });

  describe('responsive behavior', () => {
    it('handles many tools efficiently', () => {
      const manyTools: Tool[] = Array.from({ length: 10 }, (_, i) => ({
        type: 'function',
        function: {
          name: `tool_${i + 1}`,
          description: `Description for tool ${i + 1}`,
          parameters: {},
        },
        serverId: 'filesystem',
      }));

      renderWithTheme(
        <ActiveTools
          availableTools={manyTools}
          toolsLoading={false}
          mcpServers={mockMcpServers}
        />,
      );

      expect(screen.getByText('tool_1')).toBeInTheDocument();
      expect(screen.getByText('tool_10')).toBeInTheDocument();
    });

    it('maintains layout with long tool names', () => {
      const toolsWithLongNames: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'very_long_tool_name_that_might_cause_layout_issues',
            description:
              'This is a very long description that might cause layout issues',
            parameters: {},
          },
          serverId: 'filesystem',
        },
      ];

      renderWithTheme(
        <ActiveTools
          availableTools={toolsWithLongNames}
          toolsLoading={false}
          mcpServers={mockMcpServers}
        />,
      );

      expect(
        screen.getByText('very_long_tool_name_that_might_cause_layout_issues'),
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('provides proper heading structure', () => {
      renderWithTheme(<ActiveTools {...defaultProps} />);

      const heading = screen.getByRole('heading', { name: 'Active Tools' });
      expect(heading).toBeInTheDocument();
    });

    it('provides expandable sections for tool groups', () => {
      renderWithTheme(<ActiveTools {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('theme integration', () => {
    it('renders correctly with dark theme', () => {
      renderWithTheme(<ActiveTools {...defaultProps} />, darkTheme);

      expect(screen.getByText('Active Tools')).toBeInTheDocument();
      expect(screen.getByText('read_file')).toBeInTheDocument();
    });

    it('maintains proper styling with light theme', () => {
      renderWithTheme(<ActiveTools {...defaultProps} />, mockTheme);

      expect(screen.getByText('Active Tools')).toBeInTheDocument();
      expect(screen.getByText('read_file')).toBeInTheDocument();
    });
  });
});
