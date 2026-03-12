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

import type { ComponentProps } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { KBCreateStore } from './KBCreateStore';

type VsConfigHandle = ComponentProps<typeof KBCreateStore>['vsConfig'];
import { createApiTestWrapper, createAdminMockApi } from '../../test-utils';

const theme = createTheme();

interface VsConfigOverrides {
  config?: Record<string, unknown> | null;
  configSource?: string;
  saving?: boolean;
  creating?: boolean;
  save?: jest.Mock;
  reset?: jest.Mock;
  create?: jest.Mock;
}

function createVsConfigHandle(overrides: VsConfigOverrides = {}) {
  const base = {
    config: {
      vectorStoreName: 'Test Store',
      embeddingModel: 'model-1',
      embeddingDimension: 384,
      searchMode: 'semantic' as const,
      chunkingStrategy: 'auto' as const,
    },
    configSource: 'database',
    saving: false,
    creating: false,
    save: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(null),
  };
  return { ...base, ...overrides } as VsConfigHandle;
}

function createApiWithModels() {
  const api = createAdminMockApi();
  (api.listModels as jest.Mock).mockResolvedValue([
    { id: 'model-1', model_type: 'embedding' },
    { id: 'model-2', model_type: 'embedding' },
  ]);
  return api;
}

function createWrapper(api: ReturnType<typeof createAdminMockApi>) {
  const Wrapper = createApiTestWrapper(api);
  return ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>
      <Wrapper>{children}</Wrapper>
    </ThemeProvider>
  );
}

describe('KBCreateStore', () => {
  const onCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when vsConfig has no config', () => {
    const vsConfig = createVsConfigHandle({ config: null });
    const api = createApiWithModels();

    const { container } = render(
      <KBCreateStore vsConfig={vsConfig} onCreated={onCreated} />,
      { wrapper: createWrapper(api) },
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders form fields when config is available', async () => {
    const vsConfig = createVsConfigHandle();
    const api = createApiWithModels();

    render(<KBCreateStore vsConfig={vsConfig} onCreated={onCreated} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/Vector Store Name/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Embedding Model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dimension/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Search Mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Chunking/i)).toBeInTheDocument();
  });

  it('Create Store button is disabled when name is empty', async () => {
    const vsConfig = createVsConfigHandle({
      config: {
        vectorStoreName: '',
        embeddingModel: 'model-1',
        embeddingDimension: 384,
      },
    });
    const api = createApiWithModels();

    render(<KBCreateStore vsConfig={vsConfig} onCreated={onCreated} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Create Store/i }),
      ).toBeDisabled();
    });
  });

  it('Create Store button is disabled when creating', async () => {
    const vsConfig = createVsConfigHandle({ creating: true });
    const api = createApiWithModels();

    render(<KBCreateStore vsConfig={vsConfig} onCreated={onCreated} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      const createBtn = screen.getByRole('button', { name: /Creating/i });
      expect(createBtn).toBeDisabled();
    });
  });

  it('handleCreate calls vsConfig.create and onCreated on success', async () => {
    const createMock = jest.fn().mockResolvedValue({
      vectorStoreId: 'vs-123',
      vectorStoreName: 'My Store',
    });
    const vsConfig = createVsConfigHandle({ create: createMock });
    const api = createApiWithModels();

    render(<KBCreateStore vsConfig={vsConfig} onCreated={onCreated} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Create Store/i }),
      ).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /Create Store/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(createMock).toHaveBeenCalled();
      expect(onCreated).toHaveBeenCalledWith('vs-123', 'My Store');
    });

    expect(screen.getByText(/My Store.*vs-123/)).toBeInTheDocument();
  });

  it('Save as Defaults calls vsConfig.save', async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const vsConfig = createVsConfigHandle({ save: saveMock });
    const api = createApiWithModels();

    render(<KBCreateStore vsConfig={vsConfig} onCreated={onCreated} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Save as Defaults/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Save as Defaults/i }));

    await waitFor(() => {
      expect(saveMock).toHaveBeenCalled();
    });
  });

  it('Reset calls vsConfig.reset', async () => {
    const resetMock = jest.fn().mockResolvedValue(undefined);
    const vsConfig = createVsConfigHandle({
      reset: resetMock,
      configSource: 'database',
    });
    const api = createApiWithModels();

    render(<KBCreateStore vsConfig={vsConfig} onCreated={onCreated} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^Reset$/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Reset$/i }));

    await waitFor(() => {
      expect(resetMock).toHaveBeenCalled();
    });
  });

  it('Reset is disabled when configSource is yaml', async () => {
    const vsConfig = createVsConfigHandle({ configSource: 'yaml' });
    const api = createApiWithModels();

    render(<KBCreateStore vsConfig={vsConfig} onCreated={onCreated} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Reset$/i })).toBeDisabled();
    });
  });

  it('updates local config when user changes vector store name', async () => {
    const vsConfig = createVsConfigHandle();
    const api = createApiWithModels();

    render(<KBCreateStore vsConfig={vsConfig} onCreated={onCreated} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/Vector Store Name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Vector Store Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    expect(nameInput).toHaveValue('Updated Name');
  });

  it('shows HybridSearchConfig when searchMode is hybrid', async () => {
    const vsConfig = createVsConfigHandle({
      config: {
        vectorStoreName: 'Test',
        embeddingModel: 'model-1',
        embeddingDimension: 384,
        searchMode: 'hybrid',
        chunkingStrategy: 'auto',
      },
    });
    const api = createApiWithModels();

    render(<KBCreateStore vsConfig={vsConfig} onCreated={onCreated} />, {
      wrapper: createWrapper(api),
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/Vector Store Name/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Search Mode/i)).toBeInTheDocument();
  });
});
