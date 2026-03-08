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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TestApiProvider } from '@backstage/test-utils';
import { agenticChatApiRef } from '../../../api';
import { createAdminMockApi } from '../../../test-utils/factories';
import { McpServersSection } from './McpServersSection';

const theme = createTheme();

const DEFAULT_ADMIN_RESPONSE = { entry: null, source: 'default' };

/** Wraps getAdminConfig so disabledMcpServerIds always returns default. */
function wrapGetAdminConfigForMcp(mcpResponse: {
  entry: { configKey: string; configValue: unknown };
  source: string;
}) {
  return (key: string) => {
    if (key === 'disabledMcpServerIds') {
      return Promise.resolve(DEFAULT_ADMIN_RESPONSE);
    }
    if (key === 'mcpServers') {
      return Promise.resolve(mcpResponse);
    }
    return Promise.resolve(DEFAULT_ADMIN_RESPONSE);
  };
}

function renderSection(
  api = createAdminMockApi(),
  effectiveConfig: Record<string, unknown> = { mcpServers: [] },
) {
  return render(
    <ThemeProvider theme={theme}>
      <TestApiProvider apis={[[agenticChatApiRef, api as any]]}>
        <McpServersSection effectiveConfig={effectiveConfig} />
      </TestApiProvider>
    </ThemeProvider>,
  );
}

describe('McpServersSection', () => {
  it('renders empty state', async () => {
    renderSection();
    await waitFor(() => {
      expect(screen.getByText(/No additional servers/)).toBeInTheDocument();
      expect(screen.getByText('Add Server')).toBeInTheDocument();
    });
  });

  it('renders existing admin servers from config', async () => {
    const api = createAdminMockApi();
    (api.getAdminConfig as jest.Mock).mockImplementation(
      wrapGetAdminConfigForMcp({
        entry: {
          configKey: 'mcpServers',
          configValue: [
            {
              id: 'srv-1',
              name: 'Server One',
              type: 'sse',
              url: 'http://example.com/mcp',
            },
          ],
        },
        source: 'database',
      }),
    );
    renderSection(api);

    await waitFor(() => {
      expect(screen.getByText('Server One')).toBeInTheDocument();
      expect(screen.getByText('sse')).toBeInTheDocument();
    });
  });

  it('opens add dialog on button click', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Add Server')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Server'));

    await waitFor(() => {
      expect(screen.getByText('Add MCP Server')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('e.g. my-mcp-server'),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('e.g. http://localhost:3000/mcp'),
      ).toBeInTheDocument();
    });
  });

  it('removes an admin server from the list', async () => {
    const api = createAdminMockApi();
    (api.getAdminConfig as jest.Mock).mockImplementation(
      wrapGetAdminConfigForMcp({
        entry: {
          configKey: 'mcpServers',
          configValue: [
            { id: 'srv-a', name: 'A', type: 'sse', url: 'http://a.com' },
            {
              id: 'srv-b',
              name: 'B',
              type: 'streamable-http',
              url: 'http://b.com',
            },
          ],
        },
        source: 'database',
      }),
    );
    renderSection(api);

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', {
      name: /Remove server/,
    });
    fireEvent.click(deleteButtons[0]);

    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('calls setAdminConfig when saving', async () => {
    const api = createAdminMockApi();
    (api.getAdminConfig as jest.Mock).mockImplementation(
      wrapGetAdminConfigForMcp({
        entry: {
          configKey: 'mcpServers',
          configValue: [
            { id: 'srv-x', name: 'X', type: 'sse', url: 'http://x.com' },
          ],
        },
        source: 'database',
      }),
    );
    renderSection(api);

    await waitFor(() => {
      expect(screen.getByText('X')).toBeInTheDocument();
    });

    const saveButtons = screen.getAllByText('Save');
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    await waitFor(() => {
      expect(api.setAdminConfig).toHaveBeenCalledWith(
        'mcpServers',
        expect.any(Array),
      );
    });
  });

  it('shows YAML servers with edit and disable buttons but no remove', async () => {
    const api = createAdminMockApi();
    (api.getStatus as jest.Mock).mockResolvedValue({
      provider: {
        connected: true,
        model: 'test-model',
        baseUrl: 'http://localhost',
      },
      vectorStore: { connected: false },
      mcpServers: [
        {
          id: 'yaml-srv',
          name: 'YAML Server',
          url: 'http://yaml.com',
          connected: true,
          source: 'yaml',
          tools: [{ name: 'tool1', description: 'A tool' }],
          toolCount: 1,
        },
      ],
      timestamp: new Date().toISOString(),
      ready: true,
    });
    renderSection(api, {
      mcpServers: [
        {
          id: 'yaml-srv',
          name: 'YAML Server',
          type: 'streamable-http',
          url: 'http://yaml.com',
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('YAML Server')).toBeInTheDocument();
      expect(screen.getByText('YAML')).toBeInTheDocument();
    });

    // YAML servers have edit and disable, but not remove
    expect(
      screen.getByRole('button', { name: /Edit server/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Disable server/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Remove server/ }),
    ).not.toBeInTheDocument();
  });

  it('shows HITL badge on server card when requireApproval is "always"', async () => {
    const api = createAdminMockApi();
    (api.getAdminConfig as jest.Mock).mockImplementation(
      wrapGetAdminConfigForMcp({
        entry: {
          configKey: 'mcpServers',
          configValue: [
            {
              id: 'hitl-srv',
              name: 'HITL Server',
              type: 'sse',
              url: 'http://hitl.com',
              requireApproval: 'always',
            },
          ],
        },
        source: 'database',
      }),
    );
    renderSection(api);

    await waitFor(() => {
      expect(screen.getByText('HITL Server')).toBeInTheDocument();
      expect(screen.getByText('HITL')).toBeInTheDocument();
    });
  });

  it('does not show HITL badge when requireApproval is "never"', async () => {
    const api = createAdminMockApi();
    (api.getAdminConfig as jest.Mock).mockImplementation(
      wrapGetAdminConfigForMcp({
        entry: {
          configKey: 'mcpServers',
          configValue: [
            {
              id: 'auto-srv',
              name: 'Auto Server',
              type: 'sse',
              url: 'http://auto.com',
              requireApproval: 'never',
            },
          ],
        },
        source: 'database',
      }),
    );
    renderSection(api);

    await waitFor(() => {
      expect(screen.getByText('Auto Server')).toBeInTheDocument();
    });
    expect(screen.queryByText('HITL')).not.toBeInTheDocument();
  });

  it('shows Tool Approval toggle in add dialog', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Add Server')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Server'));

    await waitFor(() => {
      expect(screen.getByText('Tool Approval (HITL)')).toBeInTheDocument();
      expect(screen.getByText('Auto-execute')).toBeInTheDocument();
      expect(screen.getByText('Require Approval')).toBeInTheDocument();
    });
  });
});
