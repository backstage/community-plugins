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
import { ActiveTools } from './ActiveTools';
import type { Tool } from '../../api/McpChatApi';

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

describe('ActiveTools', () => {
  const mockMcpServers = [
    {
      name: 'filesystem',
      enabled: true,
      type: 'stdio',
    },
    {
      name: 'database',
      enabled: true,
      type: 'stdio',
    },
    {
      name: 'disabled-server',
      enabled: false,
      type: 'stdio',
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
    {
      type: 'function',
      function: {
        name: 'disabled_tool',
        description: 'Tool from disabled server',
        parameters: {},
      },
      serverId: 'disabled-server',
    },
  ];

  describe('Basic Rendering', () => {
    it('renders section title', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('Active Tools')).toBeInTheDocument();
    });

    it('displays build icon', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.getByTestId('BuildIcon')).toBeInTheDocument();
    });

    it('renders server accordions for enabled servers', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('filesystem')).toBeInTheDocument();
      expect(screen.getByText('database')).toBeInTheDocument();
      expect(screen.queryByText('disabled-server')).not.toBeInTheDocument();
    });
  });

  describe('Tool Display', () => {
    it('shows correct tool count for each server', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('2 tools')).toBeInTheDocument(); // filesystem
      expect(screen.getByText('1 tool')).toBeInTheDocument(); // database
    });

    it('displays individual tool names', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('read_file')).toBeInTheDocument();
      expect(screen.getByText('write_file')).toBeInTheDocument();
      expect(screen.getByText('execute_query')).toBeInTheDocument();
    });

    it('does not show tools from disabled servers', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.queryByText('disabled_tool')).not.toBeInTheDocument();
    });

    it('handles servers with no tools', () => {
      const serversWithNoTools = [
        {
          name: 'empty-server',
          enabled: true,
          type: 'stdio',
        },
      ];

      renderWithTheme(
        <ActiveTools
          mcpServers={serversWithNoTools}
          availableTools={[]}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('empty-server')).toBeInTheDocument();
      expect(screen.getByText('0 tools')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator when tools are loading', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={[]}
          toolsLoading
        />,
      );

      expect(screen.getAllByText('Loading tools...')).toHaveLength(2); // One for each enabled server
      expect(document.querySelectorAll('[role="progressbar"]')).toHaveLength(2);
    });

    it('shows loading count when tools are loading', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={[]}
          toolsLoading
        />,
      );

      expect(screen.getAllByText('...')).toHaveLength(2); // One for each enabled server
    });

    it('hides loading indicator when tools are loaded', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.queryByText('Loading tools...')).not.toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('handles empty server list', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={[]}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('Active Tools')).toBeInTheDocument();
      // Should not render any server accordions
      expect(screen.queryByText('filesystem')).not.toBeInTheDocument();
    });

    it('handles empty tools list', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={[]}
          toolsLoading={false}
        />,
      );

      expect(screen.getAllByText('0 tools')).toHaveLength(2); // One for each enabled server
    });

    it('shows message when no tools are available for server', () => {
      const serverWithoutTools = [
        {
          name: 'no-tools-server',
          enabled: true,
          type: 'stdio',
        },
      ];

      renderWithTheme(
        <ActiveTools
          mcpServers={serverWithoutTools}
          availableTools={[]}
          toolsLoading={false}
        />,
      );

      expect(
        screen.getByText('No tools available for this server'),
      ).toBeInTheDocument();
    });
  });

  describe('Server Filtering', () => {
    it('only shows enabled servers', () => {
      const mixedServers = [
        { name: 'enabled1', enabled: true, type: 'stdio' },
        { name: 'disabled1', enabled: false, type: 'stdio' },
        { name: 'enabled2', enabled: true, type: 'stdio' },
        { name: 'disabled2', enabled: false, type: 'stdio' },
      ];

      renderWithTheme(
        <ActiveTools
          mcpServers={mixedServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('enabled1')).toBeInTheDocument();
      expect(screen.getByText('enabled2')).toBeInTheDocument();
      expect(screen.queryByText('disabled1')).not.toBeInTheDocument();
      expect(screen.queryByText('disabled2')).not.toBeInTheDocument();
    });

    it('filters tools by server ID correctly', () => {
      const specificTools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'tool1',
            description: 'Tool 1',
            parameters: {},
          },
          serverId: 'server1',
        },
        {
          type: 'function',
          function: {
            name: 'tool2',
            description: 'Tool 2',
            parameters: {},
          },
          serverId: 'server2',
        },
      ];

      const specificServers = [
        { name: 'server1', enabled: true, type: 'stdio' },
        { name: 'server2', enabled: true, type: 'stdio' },
      ];

      renderWithTheme(
        <ActiveTools
          mcpServers={specificServers}
          availableTools={specificTools}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('tool1')).toBeInTheDocument();
      expect(screen.getByText('tool2')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('renders correctly in dark mode', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
        darkTheme,
      );

      expect(screen.getByText('Active Tools')).toBeInTheDocument();
      expect(screen.getByText('filesystem')).toBeInTheDocument();
    });

    it('applies dark theme colors to accordions', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
        darkTheme,
      );

      // Component should render with dark theme styling
      expect(screen.getByText('filesystem')).toBeInTheDocument();
    });
  });

  describe('Accordion Behavior', () => {
    it('renders expandable accordions', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      // Should have expand icons
      expect(screen.getAllByTestId('ExpandMoreIcon')).toHaveLength(2); // 2 enabled servers
    });

    it('shows tool count in accordion summary', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('2 tools')).toBeInTheDocument();
      expect(screen.getByText('1 tool')).toBeInTheDocument();
    });

    it('displays tools in accordion details', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      // Tools should be visible in accordion details
      expect(screen.getByText('read_file')).toBeInTheDocument();
      expect(screen.getByText('write_file')).toBeInTheDocument();
      expect(screen.getByText('execute_query')).toBeInTheDocument();
    });
  });

  describe('Tool Count Display', () => {
    it('shows singular form for one tool', () => {
      const singleToolServers = [
        { name: 'single-tool-server', enabled: true, type: 'stdio' },
      ];

      const singleTool: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'single_tool',
            description: 'Single tool',
            parameters: {},
          },
          serverId: 'single-tool-server',
        },
      ];

      renderWithTheme(
        <ActiveTools
          mcpServers={singleToolServers}
          availableTools={singleTool}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('1 tool')).toBeInTheDocument();
    });

    it('shows plural form for multiple tools', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('2 tools')).toBeInTheDocument();
    });

    it('shows zero tools correctly', () => {
      const emptyToolServer = [
        { name: 'empty-server', enabled: true, type: 'stdio' },
      ];

      renderWithTheme(
        <ActiveTools
          mcpServers={emptyToolServer}
          availableTools={[]}
          toolsLoading={false}
        />,
      );

      expect(screen.getByText('0 tools')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('has proper component hierarchy', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      // Should have title, accordions, and content
      expect(screen.getByText('Active Tools')).toBeInTheDocument();
      expect(screen.getByText('filesystem')).toBeInTheDocument();
      expect(screen.getByText('database')).toBeInTheDocument();
    });

    it('uses Material-UI accordion components', () => {
      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mockTools}
          toolsLoading={false}
        />,
      );

      // Should render without Material-UI errors
      expect(screen.getByText('filesystem')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('handles all required props', () => {
      expect(() => {
        renderWithTheme(
          <ActiveTools
            mcpServers={mockMcpServers}
            availableTools={mockTools}
            toolsLoading={false}
          />,
        );
      }).not.toThrow();
    });

    it('handles optional server properties', () => {
      const serversWithOptionalProps = [
        {
          id: 'server-1',
          name: 'filesystem',
          enabled: true,
          type: 'stdio',
          hasUrl: true,
          hasNpxCommand: false,
          hasScriptPath: true,
        },
      ];

      expect(() => {
        renderWithTheme(
          <ActiveTools
            mcpServers={serversWithOptionalProps}
            availableTools={mockTools}
            toolsLoading={false}
          />,
        );
      }).not.toThrow();
    });

    it('validates tool structure', () => {
      const validTools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'test_tool',
            description: 'Test tool description',
            parameters: { type: 'object' },
          },
          serverId: 'test-server',
        },
      ];

      const validServers = [
        { name: 'test-server', enabled: true, type: 'stdio' },
      ];

      expect(() => {
        renderWithTheme(
          <ActiveTools
            mcpServers={validServers}
            availableTools={validTools}
            toolsLoading={false}
          />,
        );
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles mismatched server IDs', () => {
      const mismatchedTools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'orphan_tool',
            description: 'Tool without matching server',
            parameters: {},
          },
          serverId: 'nonexistent-server',
        },
      ];

      renderWithTheme(
        <ActiveTools
          mcpServers={mockMcpServers}
          availableTools={mismatchedTools}
          toolsLoading={false}
        />,
      );

      // Should not crash, orphan tool should not be displayed
      expect(screen.queryByText('orphan_tool')).not.toBeInTheDocument();
    });

    it('handles undefined tool properties', () => {
      const toolsWithUndefined: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'test_tool',
            description: undefined as any,
            parameters: {},
          },
          serverId: 'filesystem',
        },
      ];

      expect(() => {
        renderWithTheme(
          <ActiveTools
            mcpServers={mockMcpServers}
            availableTools={toolsWithUndefined}
            toolsLoading={false}
          />,
        );
      }).not.toThrow();
    });
  });
});
