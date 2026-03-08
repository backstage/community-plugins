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

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMcpServers } from './useMcpServers';
import {
  createApiTestWrapper,
  createAdminMockApi,
  createMockStatus,
} from '../../../test-utils';

describe('useMcpServers', () => {
  const createWrapper = (api: ReturnType<typeof createAdminMockApi>) => {
    return createApiTestWrapper(api);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('loads initial state from config when entry exists', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({
            entry: {
              configKey: 'mcpServers',
              configValue: [
                {
                  id: 'server-1',
                  name: 'Test Server',
                  type: 'streamable-http',
                  url: 'https://example.com/mcp',
                },
              ],
              updatedAt: '2025-01-01T00:00:00Z',
              updatedBy: 'user:default/admin',
            },
            source: 'database',
          });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({
            entry: null,
            source: 'default',
          });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });

      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.servers.adminServers.length).toBeGreaterThan(0);
      });

      expect(result.current.servers.adminServers[0].id).toBe('server-1');
      expect(result.current.servers.adminServers[0].name).toBe('Test Server');
      expect(result.current.servers.adminServers[0].type).toBe(
        'streamable-http',
      );
      expect(result.current.servers.adminServers[0].url).toBe(
        'https://example.com/mcp',
      );
    });
  });

  describe('normalizeServerType', () => {
    it('returns streamable-http by default for unknown type', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({
            entry: {
              configKey: 'mcpServers',
              configValue: [
                {
                  id: 's1',
                  name: 'Server',
                  type: 'unknown',
                  url: 'https://example.com',
                },
              ],
              updatedAt: '2025-01-01T00:00:00Z',
              updatedBy: 'user:default/admin',
            },
            source: 'database',
          });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.servers.adminServers.length).toBeGreaterThan(0);
      });

      expect(result.current.servers.adminServers[0].type).toBe(
        'streamable-http',
      );
    });

    it('returns sse when type is sse in effectiveConfig', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(
        createMockStatus({
          mcpServers: [
            {
              id: 'sse-server',
              name: 'SSE Server',
              url: 'https://sse.example.com',
              connected: true,
              source: 'yaml',
              toolCount: 0,
            },
          ],
        }),
      );

      const effectiveConfig = {
        mcpServers: [
          {
            id: 'sse-server',
            name: 'SSE Server',
            type: 'sse',
            url: 'https://sse.example.com',
          },
        ],
      };

      const { result } = renderHook(() => useMcpServers({ effectiveConfig }), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.servers.yamlServers.length).toBeGreaterThan(0);
      });

      expect(result.current.servers.yamlServers[0].type).toBe('sse');
    });
  });

  describe('dialog state', () => {
    it('openAddDialog opens dialog', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.ui.dialogOpen).toBe(false);
      });

      act(() => {
        result.current.actions.openAddDialog();
      });

      expect(result.current.ui.dialogOpen).toBe(true);
      expect(result.current.ui.editingId).toBeNull();
      expect(result.current.ui.draft.id).toBe('');
      expect(result.current.ui.draft.url).toBe('');
    });

    it('openEditDialog opens dialog with server data', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({
            entry: {
              configKey: 'mcpServers',
              configValue: [
                {
                  id: 'edit-me',
                  name: 'Edit Server',
                  type: 'sse',
                  url: 'https://edit.example.com',
                },
              ],
              updatedAt: '2025-01-01T00:00:00Z',
              updatedBy: 'user:default/admin',
            },
            source: 'database',
          });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.servers.adminServers.length).toBeGreaterThan(0);
      });

      const server = result.current.servers.adminServers[0];

      act(() => {
        result.current.actions.openEditDialog(server);
      });

      expect(result.current.ui.dialogOpen).toBe(true);
      expect(result.current.ui.editingId).toBe('edit-me');
      expect(result.current.ui.draft.id).toBe('edit-me');
      expect(result.current.ui.draft.id).toBe('edit-me');
      expect(result.current.ui.draft.url).toBe('https://edit.example.com');
    });

    it('closeDialog closes dialog', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.ui.dialogOpen).toBe(false);
      });

      act(() => {
        result.current.actions.openAddDialog();
      });

      expect(result.current.ui.dialogOpen).toBe(true);

      act(() => {
        result.current.actions.closeDialog();
      });

      expect(result.current.ui.dialogOpen).toBe(false);
      expect(result.current.ui.editingId).toBeNull();
    });
  });

  describe('handleDialogSubmit', () => {
    it('adds new server when dialog is in add mode', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.servers.adminServers.length).toBe(0);
      });

      act(() => {
        result.current.actions.openAddDialog();
      });

      act(() => {
        result.current.actions.setDraft({
          id: 'new-server',
          name: 'New Server',
          type: 'streamable-http',
          url: 'https://new.example.com',
        });
      });

      act(() => {
        result.current.actions.handleDialogSubmit();
      });

      expect(result.current.servers.adminServers).toHaveLength(1);
      expect(result.current.servers.adminServers[0].id).toBe('new-server');
      expect(result.current.servers.adminServers[0].url).toBe(
        'https://new.example.com',
      );
      expect(result.current.ui.dialogOpen).toBe(false);
    });

    it('shows toast when adding duplicate server ID', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({
            entry: {
              configKey: 'mcpServers',
              configValue: [
                {
                  id: 'existing',
                  name: 'Existing',
                  type: 'streamable-http',
                  url: 'https://existing.example.com',
                },
              ],
              updatedAt: '2025-01-01T00:00:00Z',
              updatedBy: 'user:default/admin',
            },
            source: 'database',
          });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.servers.adminServers.length).toBeGreaterThan(0);
      });

      act(() => {
        result.current.actions.openAddDialog();
      });

      act(() => {
        result.current.actions.setDraft({
          id: 'existing',
          name: 'Duplicate',
          type: 'streamable-http',
          url: 'https://dup.example.com',
        });
      });

      act(() => {
        result.current.actions.handleDialogSubmit();
      });

      expect(result.current.ui.toast).toContain('already exists');
      expect(result.current.servers.adminServers).toHaveLength(1);
    });

    it('updates existing server when editing', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({
            entry: {
              configKey: 'mcpServers',
              configValue: [
                {
                  id: 'to-edit',
                  name: 'Original',
                  type: 'streamable-http',
                  url: 'https://original.example.com',
                },
              ],
              updatedAt: '2025-01-01T00:00:00Z',
              updatedBy: 'user:default/admin',
            },
            source: 'database',
          });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.servers.adminServers.length).toBeGreaterThan(0);
      });

      const server = result.current.servers.adminServers[0];

      act(() => {
        result.current.actions.openEditDialog(server);
      });

      act(() => {
        result.current.actions.setDraft({
          ...server,
          name: 'Updated Name',
          url: 'https://updated.example.com',
        });
      });

      act(() => {
        result.current.actions.handleDialogSubmit();
      });

      expect(result.current.servers.adminServers[0].name).toBe('Updated Name');
      expect(result.current.servers.adminServers[0].url).toBe(
        'https://updated.example.com',
      );
    });
  });

  describe('handleRemoveAdmin', () => {
    it('removes a server from admin list', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({
            entry: {
              configKey: 'mcpServers',
              configValue: [
                {
                  id: 'remove-1',
                  name: 'Remove Me',
                  type: 'streamable-http',
                  url: 'https://remove.example.com',
                },
              ],
              updatedAt: '2025-01-01T00:00:00Z',
              updatedBy: 'user:default/admin',
            },
            source: 'database',
          });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.servers.adminServers.length).toBe(1);
      });

      act(() => {
        result.current.actions.handleRemoveAdmin('remove-1');
      });

      expect(result.current.servers.adminServers).toHaveLength(0);
    });
  });

  describe('handleToggleDisable', () => {
    it('toggles disabled state for a server', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(
        createMockStatus({
          mcpServers: [
            {
              id: 'toggle-1',
              name: 'Toggle Server',
              url: 'https://toggle.example.com',
              connected: true,
              source: 'yaml',
              toolCount: 0,
            },
          ],
        }),
      );

      const effectiveConfig = {
        mcpServers: [
          {
            id: 'toggle-1',
            name: 'Toggle Server',
            type: 'streamable-http',
            url: 'https://toggle.example.com',
          },
        ],
      };

      const { result } = renderHook(() => useMcpServers({ effectiveConfig }), {
        wrapper: createWrapper(api),
      });

      await waitFor(() => {
        expect(result.current.servers.yamlServers.length).toBeGreaterThan(0);
      });

      expect(result.current.servers.disabledIds.has('toggle-1')).toBe(false);

      act(() => {
        result.current.actions.handleToggleDisable('toggle-1');
      });

      expect(result.current.servers.disabledIds.has('toggle-1')).toBe(true);

      act(() => {
        result.current.actions.handleToggleDisable('toggle-1');
      });

      expect(result.current.servers.disabledIds.has('toggle-1')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('accepts valid http URL', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.ui.dialogOpen).toBeDefined();
      });

      const error = result.current.actions.validateUrl(
        'https://valid.example.com/mcp',
      );
      expect(error).toBeNull();
    });

    it('rejects invalid URL format', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.actions.validateUrl).toBeDefined();
      });

      const error = result.current.actions.validateUrl('not-a-url');
      expect(error).toBe('Invalid URL format');
    });

    it('rejects non-http protocol', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.actions.validateUrl).toBeDefined();
      });

      const error = result.current.actions.validateUrl('ftp://example.com');
      expect(error).toContain('http:// or https://');
    });
  });

  describe('draftValid', () => {
    it('is false when adding with empty id', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.ui.dialogOpen).toBeDefined();
      });

      act(() => {
        result.current.actions.openAddDialog();
      });

      expect(result.current.ui.draftValid).toBe(false);
    });

    it('is true when adding with valid id and url', async () => {
      const api = createAdminMockApi();
      (api.getAdminConfig as jest.Mock).mockImplementation((key: string) => {
        if (key === 'mcpServers') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        if (key === 'disabledMcpServerIds') {
          return Promise.resolve({ entry: null, source: 'default' });
        }
        return Promise.resolve({ entry: null, source: 'default' });
      });
      (api.getStatus as jest.Mock).mockResolvedValue(createMockStatus());

      const { result } = renderHook(
        () => useMcpServers({ effectiveConfig: null }),
        { wrapper: createWrapper(api) },
      );

      await waitFor(() => {
        expect(result.current.ui.dialogOpen).toBeDefined();
      });

      act(() => {
        result.current.actions.openAddDialog();
      });

      act(() => {
        result.current.actions.setDraft({
          id: 'valid-id',
          name: 'Valid',
          type: 'streamable-http',
          url: 'https://valid.example.com',
        });
      });

      expect(result.current.ui.draftValid).toBe(true);
    });
  });
});
