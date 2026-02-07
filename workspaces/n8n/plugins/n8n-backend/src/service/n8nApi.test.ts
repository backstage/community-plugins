/*
 * Copyright 2026 The Backstage Authors
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

import { N8nApi } from './n8nApi';

// Save real fetch and mock it
const mockFetch = jest.fn();
jest.mock('node-fetch', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockFetch(...args),
}));

describe('N8nApi', () => {
  const baseUrl = 'http://localhost:5678';
  const apiKey = 'test-api-key';
  let api: N8nApi;

  beforeEach(() => {
    api = new N8nApi({ baseUrl, apiKey });
    mockFetch.mockReset();
  });

  function mockResponse(body: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    });
  }

  describe('getWorkflows', () => {
    it('should fetch workflows with correct headers', async () => {
      mockResponse({
        data: [
          {
            id: '1',
            name: 'Test Workflow',
            active: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      });

      const workflows = await api.getWorkflows();

      expect(workflows).toHaveLength(1);
      expect(workflows[0].name).toBe('Test Workflow');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/workflows'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-N8N-API-KEY': apiKey,
          }),
        }),
      );
    });
  });

  describe('getWorkflow', () => {
    it('should fetch a single workflow by id', async () => {
      mockResponse({
        id: '1',
        name: 'Test Workflow',
        active: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const workflow = await api.getWorkflow('1');

      expect(workflow.id).toBe('1');
      expect(workflow.name).toBe('Test Workflow');
    });

    it('should throw NotFoundError for 404', async () => {
      mockResponse('Not Found', 404);

      await expect(api.getWorkflow('999')).rejects.toThrow(/not found/i);
    });
  });

  describe('getExecutions', () => {
    it('should fetch executions for a workflow', async () => {
      mockResponse({
        data: [
          {
            id: '100',
            finished: true,
            mode: 'trigger',
            startedAt: '2024-01-01T00:00:00.000Z',
            stoppedAt: '2024-01-01T00:01:00.000Z',
            workflowId: '1',
            status: 'success',
          },
        ],
      });

      const executions = await api.getExecutions('1');

      expect(executions).toHaveLength(1);
      expect(executions[0].status).toBe('success');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('workflowId=1'),
        expect.anything(),
      );
    });
  });

  describe('activateWorkflow', () => {
    it('should activate a workflow', async () => {
      mockResponse({
        id: '1',
        name: 'Test Workflow',
        active: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const workflow = await api.activateWorkflow('1');

      expect(workflow.active).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/workflows/1/activate'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('deactivateWorkflow', () => {
    it('should deactivate a workflow', async () => {
      mockResponse({
        id: '1',
        name: 'Test Workflow',
        active: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const workflow = await api.deactivateWorkflow('1');

      expect(workflow.active).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/workflows/1/deactivate'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
