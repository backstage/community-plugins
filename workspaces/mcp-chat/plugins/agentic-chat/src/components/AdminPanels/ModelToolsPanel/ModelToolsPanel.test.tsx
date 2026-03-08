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
import { AgentConfigPanel } from './ModelToolsPanel';

const theme = createTheme();

function renderPanel(api = createAdminMockApi()) {
  const apiWithProviders = {
    ...api,
    listProviders:
      (api as any).listProviders ??
      jest.fn().mockResolvedValue({
        providers: [
          {
            id: 'test',
            displayName: 'Test Provider',
            capabilities: {
              safety: true,
              mcpTools: true,
              rag: true,
              evaluation: true,
            },
            implemented: true,
          },
        ],
        activeProviderId: 'test',
      }),
  };
  return render(
    <ThemeProvider theme={theme}>
      <TestApiProvider apis={[[agenticChatApiRef, apiWithProviders as any]]}>
        <AgentConfigPanel />
      </TestApiProvider>
    </ThemeProvider>,
  );
}

describe('AgentConfigPanel', () => {
  it('renders page title', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText('Agent Config')).toBeInTheDocument();
    });
  });

  it('renders all 7 sub-tabs', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Model' })).toBeInTheDocument();
      expect(screen.getByText('Agent Instructions')).toBeInTheDocument();
      expect(screen.getByText('Tools')).toBeInTheDocument();
      expect(screen.getByText('MCP Servers')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Safety' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Evals' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'RAG' })).toBeInTheDocument();
    });
  });

  it('shows Model Connection section by default', async () => {
    const api = createAdminMockApi();
    (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
      if (key === 'model')
        return Promise.resolve({
          entry: { configKey: 'model', configValue: 'llama-3' },
          source: 'database',
        });
      return Promise.resolve({ entry: null, source: 'default' });
    });
    renderPanel(api);

    await waitFor(() => {
      const modelInput = screen.getByLabelText('Model') as HTMLInputElement;
      expect(modelInput.value).toBe('llama-3');
    });
  });

  it('switches to Tools tab and shows tools config', async () => {
    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('Tools')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Tools'));

    await waitFor(() => {
      expect(screen.getByText('Tools Configuration')).toBeInTheDocument();
    });
  });

  it('switches to Safety tab', async () => {
    renderPanel();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Safety' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Safety' }));

    await waitFor(() => {
      expect(screen.getByText('Test Provider Shields')).toBeInTheDocument();
    });
  });

  it('renders model field as autocomplete with dropdown', async () => {
    const api = createAdminMockApi();
    renderPanel(api);

    await waitFor(() => {
      expect(screen.getByLabelText('Model')).toBeInTheDocument();
    });

    expect(api.listModels).toHaveBeenCalled();

    const modelInput = screen.getByLabelText('Model');
    expect(modelInput).toHaveAttribute('role', 'combobox');
  });

  it('shows refresh button for models', async () => {
    renderPanel();

    await waitFor(() => {
      expect(screen.getByLabelText('Model')).toBeInTheDocument();
    });

    const refreshButtons = screen.getAllByRole('button');
    const refreshBtn = refreshButtons.find(
      btn => btn.querySelector('[data-testid="RefreshIcon"]') !== null,
    );
    expect(refreshBtn).toBeDefined();
  });

  it('pre-populates Model Connection fields from effective config', async () => {
    const api = createAdminMockApi();
    renderPanel(api);

    await waitFor(() => {
      const modelInput = screen.getByLabelText('Model') as HTMLInputElement;
      expect(modelInput.value).toBe('meta-llama/Llama-3.3-8B-Instruct');
    });

    const baseUrlInput = screen.getByLabelText('Base URL') as HTMLInputElement;
    expect(baseUrlInput.value).toBe('http://localhost:8321');
  });
});
