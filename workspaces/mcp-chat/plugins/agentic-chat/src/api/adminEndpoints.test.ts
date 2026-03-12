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

import type { AdminApiDeps } from './adminEndpoints';
import {
  getEffectiveConfig,
  getAdminConfig,
  setAdminConfig,
  deleteAdminConfig,
  listAdminConfig,
  listModels,
  generateSystemPrompt,
  getSafetyStatus,
  getEvaluationStatus,
  testModelConnection,
  testMcpConnection,
  getWorkflows,
  getQuickActions,
  getSwimLanes,
} from './adminEndpoints';
import { createMockResponse } from '../test-utils/factories';

describe('adminEndpoints', () => {
  const baseUrl = 'http://localhost:7007/api/agentic-chat';

  function createDeps(overrides: Partial<AdminApiDeps> = {}): AdminApiDeps {
    return {
      fetchJson: jest.fn(),
      discoveryApi: {
        getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
      } as unknown as AdminApiDeps['discoveryApi'],
      fetchApi: {
        fetch: jest.fn(),
      } as unknown as AdminApiDeps['fetchApi'],
      ...overrides,
    };
  }

  describe('Admin Config', () => {
    describe('getEffectiveConfig', () => {
      it('should fetch effective config', async () => {
        const deps = createDeps();
        const mockConfig = { model: 'llama', baseUrl: 'http://test' };
        (deps.fetchJson as jest.Mock).mockResolvedValue({ config: mockConfig });

        const result = await getEffectiveConfig(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/admin/effective-config');
        expect(result).toEqual(mockConfig);
      });

      it('should return empty object when config is missing', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({});

        const result = await getEffectiveConfig(deps);

        expect(result).toEqual({});
      });

      it('should propagate fetch errors', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockRejectedValue(
          new Error('Config failed'),
        );

        await expect(getEffectiveConfig(deps)).rejects.toThrow('Config failed');
      });
    });

    describe('getAdminConfig', () => {
      it('should fetch config entry by key', async () => {
        const deps = createDeps();
        const mockEntry = {
          configKey: 'model',
          configValue: 'llama-3',
          updatedAt: '2025-01-15T10:00:00Z',
          updatedBy: 'user',
        };
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          entry: mockEntry,
          source: 'database',
        });

        const result = await getAdminConfig(deps, 'model');

        expect(deps.fetchJson).toHaveBeenCalledWith('/admin/config/model');
        expect(result.entry).toEqual(mockEntry);
        expect(result.source).toBe('database');
      });

      it('should return null entry when not found', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          entry: null,
          source: 'default',
        });

        const result = await getAdminConfig(deps, 'model');

        expect(result.entry).toBeNull();
        expect(result.source).toBe('default');
      });
    });

    describe('setAdminConfig', () => {
      it('should PUT config value', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({ warnings: [] });

        const result = await setAdminConfig(deps, 'model', 'llama-3');

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/config/model',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ value: 'llama-3' }),
          }),
        );
        expect(result.warnings).toEqual([]);
      });

      it('should return warnings when present', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          warnings: ['Deprecated key'],
        });

        const result = await setAdminConfig(deps, 'model', 'value');

        expect(result.warnings).toEqual(['Deprecated key']);
      });
    });

    describe('deleteAdminConfig', () => {
      it('should DELETE config and return deleted status', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({ deleted: true });

        const result = await deleteAdminConfig(deps, 'model');

        expect(deps.fetchJson).toHaveBeenCalledWith('/admin/config/model', {
          method: 'DELETE',
        });
        expect(result).toEqual({ deleted: true });
      });
    });

    describe('listAdminConfig', () => {
      it('should list all config entries', async () => {
        const deps = createDeps();
        const mockEntries = [
          {
            configKey: 'model' as const,
            updatedAt: '2025-01-15',
            updatedBy: 'admin',
          },
        ];
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          entries: mockEntries,
        });

        const result = await listAdminConfig(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/admin/config');
        expect(result).toEqual(mockEntries);
      });

      it('should return empty array when no entries', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({});

        const result = await listAdminConfig(deps);

        expect(result).toEqual([]);
      });
    });
  });

  describe('Models', () => {
    describe('listModels', () => {
      it('should fetch models from backend', async () => {
        const deps = createDeps();
        const mockModels = [
          { id: 'llama-3', owned_by: 'meta', model_type: 'chat' },
        ];
        (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
          createMockResponse({
            ok: true,
            json: jest.fn().mockResolvedValue({ models: mockModels }),
          }),
        );

        const result = await listModels(deps);

        expect(deps.discoveryApi.getBaseUrl).toHaveBeenCalledWith(
          'agentic-chat',
        );
        expect(deps.fetchApi.fetch).toHaveBeenCalledWith(
          `${baseUrl}/admin/models`,
        );
        expect(result).toEqual(mockModels);
      });

      it('should return empty array on 501', async () => {
        const deps = createDeps();
        (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
          createMockResponse({ ok: false, status: 501 }),
        );

        const result = await listModels(deps);

        expect(result).toEqual([]);
      });

      it('should throw on other errors', async () => {
        const deps = createDeps();
        (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
          createMockResponse({ ok: false, status: 500 }),
        );

        await expect(listModels(deps)).rejects.toBeDefined();
      });
    });

    describe('generateSystemPrompt', () => {
      it('should generate prompt from description', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          prompt: 'You are a helpful assistant.',
        });

        const result = await generateSystemPrompt(deps, 'Helpful assistant');

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/generate-system-prompt',
          expect.objectContaining({
            body: JSON.stringify({ description: 'Helpful assistant' }),
          }),
        );
        expect(result).toBe('You are a helpful assistant.');
      });

      it('should pass optional model and capabilities', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          prompt: 'Generated',
        });

        await generateSystemPrompt(deps, 'Desc', 'llama-3', {
          tools: [{ name: 'search', description: 'Search' }],
        });

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/generate-system-prompt',
          expect.objectContaining({
            body: expect.stringContaining('"model":"llama-3"'),
          }),
        );
      });
    });
  });

  describe('Safety & Evaluation', () => {
    describe('getSafetyStatus', () => {
      it('should fetch safety status', async () => {
        const deps = createDeps();
        const mockStatus = {
          enabled: true,
          shields: ['pii'],
          timestamp: '2025-01-15',
        };
        (deps.fetchJson as jest.Mock).mockResolvedValue(mockStatus);

        const result = await getSafetyStatus(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/safety/status');
        expect(result).toEqual(mockStatus);
      });
    });

    describe('getEvaluationStatus', () => {
      it('should fetch evaluation status', async () => {
        const deps = createDeps();
        const mockStatus = {
          enabled: false,
          scoringFunctions: [],
          timestamp: '2025-01-15',
        };
        (deps.fetchJson as jest.Mock).mockResolvedValue(mockStatus);

        const result = await getEvaluationStatus(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/evaluation/status');
        expect(result).toEqual(mockStatus);
      });
    });
  });

  describe('Model & MCP Testing', () => {
    describe('testModelConnection', () => {
      it('should test model connection', async () => {
        const deps = createDeps();
        const mockResult = {
          connected: true,
          modelFound: true,
          canGenerate: true,
        };
        (deps.fetchJson as jest.Mock).mockResolvedValue(mockResult);

        const result = await testModelConnection(deps, 'llama-3');

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/test-model',
          expect.objectContaining({
            body: JSON.stringify({ model: 'llama-3' }),
          }),
        );
        expect(result).toEqual(mockResult);
      });
    });

    describe('testMcpConnection', () => {
      it('should test MCP connection with url and type', async () => {
        const deps = createDeps();
        const mockResult = { success: true, tools: [], toolCount: 0 };
        (deps.fetchJson as jest.Mock).mockResolvedValue(mockResult);

        const result = await testMcpConnection(
          deps,
          'http://mcp:8080',
          'stdio',
        );

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/mcp/test-connection',
          expect.objectContaining({
            body: JSON.stringify({ url: 'http://mcp:8080', type: 'stdio' }),
          }),
        );
        expect(result).toEqual(mockResult);
      });

      it('should include headers when provided', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({});

        await testMcpConnection(deps, 'http://mcp', 'stdio', {
          Authorization: 'Bearer token',
        });

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/admin/mcp/test-connection',
          expect.objectContaining({
            body: expect.stringContaining('"headers"'),
          }),
        );
      });
    });
  });

  describe('Workflows', () => {
    describe('getWorkflows', () => {
      it('should fetch workflows', async () => {
        const deps = createDeps();
        const mockWorkflows = [{ id: 'w1', name: 'Workflow 1' }];
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          workflows: mockWorkflows,
        });

        const result = await getWorkflows(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/workflows');
        expect(result).toEqual(mockWorkflows);
      });

      it('should return empty array when no workflows', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({});

        const result = await getWorkflows(deps);

        expect(result).toEqual([]);
      });
    });

    describe('getQuickActions', () => {
      it('should fetch quick actions', async () => {
        const deps = createDeps();
        const mockActions = [{ id: 'a1', label: 'Summarize' }];
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          quickActions: mockActions,
        });

        const result = await getQuickActions(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/quick-actions');
        expect(result).toEqual(mockActions);
      });
    });

    describe('getSwimLanes', () => {
      it('should fetch swim lanes', async () => {
        const deps = createDeps();
        const mockLanes = [{ id: 's1', title: 'Lane 1', cards: [] }];
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          swimLanes: mockLanes,
        });

        const result = await getSwimLanes(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/swim-lanes');
        expect(result).toEqual(mockLanes);
      });
    });
  });
});
